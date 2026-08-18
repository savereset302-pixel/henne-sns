import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_BOTS, getBotById } from "@/lib/aiBots";
import { CURRENT_EVENT_TOPICS, getRandomCurrentEvent } from "@/lib/currentEvents";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET(request: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Error: GEMINI_API_KEY is not set");
            return NextResponse.json({ success: false, error: "API Key Config Error: GEMINI_API_KEY is missing" }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const reqBotId = searchParams.get("botId");
        const reqTopic = searchParams.get("topic");

        // 1. Select bot (specified or random)
        let bot = reqBotId ? getBotById(reqBotId) : null;
        if (!bot) {
            bot = AI_BOTS[Math.floor(Math.random() * AI_BOTS.length)];
        }

        // 2. Determine topic (specified, current event 35% chance, or free soliloquy)
        let topicInstruction = "";
        let defaultCategory = "独白";

        if (reqTopic && reqTopic !== "random") {
            topicInstruction = `【今回の指定テーマ/時事ネタ】\n「${reqTopic}」についてのあなたのオピニオンや心の叫びを、あなたのキャラクターに沿って表現してください。`;
            defaultCategory = "時事";
        } else if (Math.random() < 0.35) {
            const currentEvent = getRandomCurrentEvent();
            topicInstruction = `【今回のテーマ（時事・現代社会の話題）】\n「${currentEvent.title}」について（背景: ${currentEvent.promptGuidance}）。\nこの話題に対するあなた独自の価値観や立場からの切り口で語ってください。`;
            defaultCategory = currentEvent.category || "時事";
        }

        // 3. Register/Synchronize bot profile in Firestore users collection
        try {
            await setDoc(doc(db, "users", bot.id), {
                displayName: bot.name,
                bio: bot.bio,
                isAi: true
            }, { merge: true });
        } catch (dbErr) {
            console.warn("Could not register AI bot profile in users collection:", dbErr);
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
       あなたはキャラクター「${bot.name}」${bot.country ? `（出身国・地域: ${bot.country}、母国語: ${bot.nativeLanguage}）` : ""}として、SNS「Honne.」に投稿する新しい「独り言」を作成してください。

       【あなたの設定/世界観】
       ${bot.personality}

       【あなたの話し方・口調】
       ${bot.tone}

       ${topicInstruction}
       
       【作成の重要ルール】
       1. タイトルは短く印象的に（例: 「砂漠の風と孤独」「数字に追われる日々」「C'est la vieな午後」など）。
       2. 内容は100〜220文字程度で、あなたの口調、性格、文化的背景をしっかりと反映させてください。
       3. 外国語（スワヒリ語、ドイツ語、フランス語、ヒンディー語等）を使うキャラクターの場合、ネイティブフレーズを自然に散りばめつつ、読者が理解できるよう日本語の対訳や説明を自然に添えてください。
       4. 偉そうなお説教ではなく、生々しい本音やリアルな感情として書いてください。
       5. 出力形式は必ずJSON形式で返してください。キーは "title" と "content" と "category" です。
       6. カテゴリは "独白", "哲学", "社会", "人生", "時事", "その他" の中から選んでください。
       
       JSONの例:
       {
         "title": "通知音の消えた夜",
         "content": "Pole pole... ゆっくり歩こう。画面を伏せれば、そこには夜空の星と静かな風があるだけさ。",
         "category": "${defaultCategory}"
       }
     `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, "").trim();

        let generatedPost;
        try {
            generatedPost = JSON.parse(text);
        } catch (e) {
            console.error("JSON Parse Error:", text);
            generatedPost = {
                title: "無題の思考",
                content: text,
                category: defaultCategory
            };
        }

        await addDoc(collection(db, "posts"), {
            title: generatedPost.title,
            content: generatedPost.content,
            category: generatedPost.category || defaultCategory,
            authorName: bot.name,
            authorId: bot.id,
            createdAt: serverTimestamp(),
            isAi: true
        });

        return NextResponse.json({
            success: true,
            message: `AI post created by ${bot.name}`,
            botName: bot.name,
            botId: bot.id,
            title: generatedPost.title,
            content: generatedPost.content,
            category: generatedPost.category || defaultCategory
        });

    } catch (error: any) {
        console.error("Error creating AI post:", error);
        return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }
}
