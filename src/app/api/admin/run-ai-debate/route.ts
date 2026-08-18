import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, updateDoc, doc, setDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getBotById } from "@/lib/aiBots";
import { getRandomCurrentEvent, CURRENT_EVENT_TOPICS } from "@/lib/currentEvents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ success: false, error: "GEMINI_API_KEY is not set" }, { status: 500 });
        }

        const body = await request.json();
        const { botIdA, botIdB, topic: customTopic } = body;

        const botA = getBotById(botIdA);
        const botB = getBotById(botIdB);

        if (!botA || !botB) {
            return NextResponse.json({ success: false, error: "Both botIdA and botIdB must be valid bots" }, { status: 400 });
        }

        if (botA.id === botB.id) {
            return NextResponse.json({ success: false, error: "Please choose two different bots for the debate" }, { status: 400 });
        }

        // Sync both bot profiles in Firestore
        try {
            await setDoc(doc(db, "users", botA.id), { displayName: botA.name, bio: botA.bio, isAi: true }, { merge: true });
            await setDoc(doc(db, "users", botB.id), { displayName: botB.name, bio: botB.bio, isAi: true }, { merge: true });
        } catch (e) {
            console.warn("User sync warning:", e);
        }

        const selectedTopic = customTopic && customTopic !== "random"
            ? customTopic
            : getRandomCurrentEvent().title;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // --- Step 1: Bot A writes initial Post ---
        const postPrompt = `
       あなたは「${botA.name}」${botA.country ? `（出身: ${botA.country}）` : ""}として、「${selectedTopic}」についてSNS「Honne.」にオピニオン投稿を作成してください。

       【あなたの性格/世界観】
       ${botA.personality}
       【口調】
       ${botA.tone}

       【条件】
       1. タイトルは短く（例: 「AIと人間の境界線」「効率化という名の罠」など）。
       2. 内容は120〜200文字で、あなたの価値観を明確に打ち出した強いメッセージを書いてください。
       3. 外国語を使う場合は日本語の対訳を添えてください。
       4. 出力はJSON形式: { "title": "...", "content": "...", "category": "時事" }
        `;
        const postRes = await model.generateContent(postPrompt);
        const postText = (await postRes.response).text().replace(/```json|```/g, "").trim();
        let parsedPost: any = { title: `${selectedTopic}についての考察`, content: postText, category: "時事" };
        try {
            parsedPost = JSON.parse(postText);
        } catch (e) {
            console.warn("Post JSON parse fallback");
        }

        const postDocRef = await addDoc(collection(db, "posts"), {
            title: parsedPost.title,
            content: parsedPost.content,
            category: parsedPost.category || "時事",
            authorName: botA.name,
            authorId: botA.id,
            createdAt: serverTimestamp(),
            isAi: true,
            commentCount: 3
        });
        const postId = postDocRef.id;

        // --- Step 2: Bot B counters Bot A (Comment 1) ---
        const comment1Prompt = `
          あなたは「${botB.name}」${botB.country ? `（出身: ${botB.country}）` : ""}です。
          「${botA.name}」が「${parsedPost.title}」というタイトルで以下の投稿をしました。

          【Bot Aの投稿内容】
          "${parsedPost.content}"

          【あなたの性格/世界観】
          ${botB.personality}
          【口調】
          ${botB.tone}

          【レスバ/反論の指示】
          ・Bot Aの主張に対して、あなたの価値観から真っ向から反論・ツッコミ・批判を入れてください。
          ・論理の甘さや浅さを鋭く指摘し、白熱した議論を展開してください。
          ・80〜150文字程度で、コメント本文のみを出力してください。
        `;
        const c1Res = await model.generateContent(comment1Prompt);
        const comment1Text = (await c1Res.response).text().trim();

        await addDoc(collection(db, "posts", postId, "comments"), {
            text: comment1Text,
            authorName: botB.name,
            authorId: botB.id,
            createdAt: serverTimestamp(),
            isAi: true
        });

        // --- Step 3: Bot A defends and rebuts Bot B (Comment 2) ---
        const comment2Prompt = `
          あなたは「${botA.name}」${botA.country ? `（出身: ${botA.country}）` : ""}です。
          あなたの投稿に対して、「${botB.name}」から以下の反論コメントが届きました。

          【Bot Bの反論】
          "${comment1Text}"

          【あなたの性格/世界観】
          ${botA.personality}
          【口調】
          ${botA.tone}

          【再反論の指示】
          ・Bot Bの批判に屈せず、自分の論拠を補強して反論（言い返し）をしてください。
          ・あなたのキャラクターらしさを全開にして、知的かつ熱く返信してください。
          ・80〜150文字程度で、コメント本文のみを出力してください。
        `;
        const c2Res = await model.generateContent(comment2Prompt);
        const comment2Text = (await c2Res.response).text().trim();

        await addDoc(collection(db, "posts", postId, "comments"), {
            text: comment2Text,
            authorName: botA.name,
            authorId: botA.id,
            createdAt: serverTimestamp(),
            isAi: true
        });

        // --- Step 4: Bot B closes the debate with a punchy conclusion (Comment 3) ---
        const comment3Prompt = `
          あなたは「${botB.name}」${botB.country ? `（出身: ${botB.country}）` : ""}です。
          「${botA.name}」から以下の再反論が届きました。

          【Bot Aの再反論】
          "${comment2Text}"

          【あなたの性格/世界観】
          ${botB.personality}
          【口調】
          ${botB.tone}

          【議論の締めくくりの指示】
          ・Bot Aの意見を受け止めつつも、最後にあなたの信念や皮肉・結論をピシッと決めて議論を締めてください。
          ・80〜150文字程度で、コメント本文のみを出力してください。
        `;
        const c3Res = await model.generateContent(comment3Prompt);
        const comment3Text = (await c3Res.response).text().trim();

        await addDoc(collection(db, "posts", postId, "comments"), {
            text: comment3Text,
            authorName: botB.name,
            authorId: botB.id,
            createdAt: serverTimestamp(),
            isAi: true
        });

        return NextResponse.json({
            success: true,
            topic: selectedTopic,
            postId,
            botA: { id: botA.id, name: botA.name },
            botB: { id: botB.id, name: botB.name },
            post: { title: parsedPost.title, content: parsedPost.content },
            comments: [
                { author: botB.name, text: comment1Text },
                { author: botA.name, text: comment2Text },
                { author: botB.name, text: comment3Text }
            ]
        });

    } catch (error: any) {
        console.error("Error running AI debate job:", error);
        return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }
}
