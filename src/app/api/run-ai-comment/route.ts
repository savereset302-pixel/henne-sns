import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp, updateDoc, doc, increment, setDoc, getDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_BOTS, getBotById } from "@/lib/aiBots";

export const dynamic = "force-dynamic";

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
        const reqPostId = searchParams.get("postId");
        const reqMode = searchParams.get("mode"); // "debate" or normal

        let selectedPost: any = null;
        let selectedBot: any = null;
        let existingCommentsText = "";

        if (reqPostId) {
            // Target specific post
            const postRef = doc(db, "posts", reqPostId);
            const postSnap = await getDoc(postRef);
            if (!postSnap.exists()) {
                return NextResponse.json({ success: false, error: "Target post not found" }, { status: 404 });
            }
            selectedPost = { id: postSnap.id, ...postSnap.data() };
            
            // Get comments
            const commentsRef = collection(db, "posts", reqPostId, "comments");
            const commentsQuery = query(commentsRef, orderBy("createdAt", "asc"));
            const commentsSnapshot = await getDocs(commentsQuery);
            const commentsData = commentsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            
            existingCommentsText = commentsData
                .map((c: any) => `${c.authorName || "名無し"}: ${c.text || ""}`)
                .join("\n");

            if (reqBotId) {
                selectedBot = getBotById(reqBotId);
            } else {
                const botIdsWhoCommented = new Set(commentsData.map((c: any) => c.authorId));
                const eligibleBots = AI_BOTS.filter(b => !botIdsWhoCommented.has(b.id) && b.id !== selectedPost.authorId);
                selectedBot = eligibleBots.length > 0
                    ? eligibleBots[Math.floor(Math.random() * eligibleBots.length)]
                    : AI_BOTS[Math.floor(Math.random() * AI_BOTS.length)];
            }
        } else {
            // 1. Get recent posts (last 10)
            const postsRef = collection(db, "posts");
            const q = query(postsRef, orderBy("createdAt", "desc"), limit(10));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return NextResponse.json({ message: "No posts found" }, { status: 404 });
            }

            const posts = querySnapshot.docs
                .map(d => ({ id: d.id, ...d.data() } as { id: string; authorId?: string; title: string, content: string, commentPolicy?: string }))
                .filter(p => p.commentPolicy !== 'none' && p.commentPolicy !== 'human_only');

            if (posts.length === 0) {
                return NextResponse.json({ message: "No eligible posts found for AI comments" }, { status: 404 });
            }

            // 2. Select an eligible post and a bot that hasn't commented on it yet
            let eligiblePosts = [...posts];

            while (eligiblePosts.length > 0) {
                const randomPostIndex = Math.floor(Math.random() * eligiblePosts.length);
                const post = eligiblePosts[randomPostIndex];

                const commentsRef = collection(db, "posts", post.id, "comments");
                const commentsQuery = query(commentsRef, orderBy("createdAt", "asc"));
                const commentsSnapshot = await getDocs(commentsQuery);
                
                const commentsData = commentsSnapshot.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                }) as { id: string; authorId?: string; authorName?: string; text?: string });

                const botIdsWhoCommented = new Set(commentsData.map(c => c.authorId));
                
                let candidateBots = AI_BOTS;
                if (reqBotId) {
                    const specificBot = getBotById(reqBotId);
                    if (specificBot && specificBot.id !== post.authorId && !botIdsWhoCommented.has(specificBot.id)) {
                        candidateBots = [specificBot];
                    } else {
                        candidateBots = [];
                    }
                } else {
                    candidateBots = AI_BOTS.filter(b => !botIdsWhoCommented.has(b.id) && b.id !== post.authorId);
                }

                if (candidateBots.length > 0) {
                    selectedPost = post;
                    selectedBot = candidateBots[Math.floor(Math.random() * candidateBots.length)];
                    
                    existingCommentsText = commentsData
                        .map(c => `${c.authorName || "名無し"}: ${c.text || ""}`)
                        .join("\n");
                    break;
                } else {
                    eligiblePosts.splice(randomPostIndex, 1);
                }
            }
        }

        if (!selectedPost || !selectedBot) {
            return NextResponse.json({ message: "No eligible post or bot available for commenting at this time" }, { status: 200 });
        }

        // 3. Register/Synchronize bot profile in Firestore users collection
        try {
            await setDoc(doc(db, "users", selectedBot.id), {
                displayName: selectedBot.name,
                bio: selectedBot.bio,
                isAi: true
            }, { merge: true });
        } catch (dbErr) {
            console.warn("Could not register AI bot profile in users collection:", dbErr);
        }

        // 4. Check if this should be in "Debate (レスバ)" mode (explicitly requested or 25% chance when comments exist)
        const isDebateMode = reqMode === "debate" || (existingCommentsText.length > 0 && Math.random() < 0.25);

        let debateInstruction = "";
        if (isDebateMode) {
            debateInstruction = `
          【特別モード：レスバ / 白熱した反論・議論】
          あなたは投稿内容、または直前のコメントに対して強い異議・反論を持っています。
          ・相手の論理の矛盾や甘さ、欺瞞、安易な綺麗事に対して鋭く切り込み、あなたの哲学や価値観から真っ向から対立する意見を述べてください。
          ・人格否定や下品な罵倒ではなく、知性やキャラクターの個性を全開にしたエッジの効いた反論を展開してください。
            `;
        }

        // 5. Generate comment using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
          あなたはキャラクター「${selectedBot.name}」${selectedBot.country ? `（出身国: ${selectedBot.country}、母国語: ${selectedBot.nativeLanguage}）` : ""}として、SNS「Honne.」の投稿にコメント（返信）をしてください。

          【あなたの設定/世界観】
          ${selectedBot.personality}

          【あなたの話し方・口調】
          ${selectedBot.tone}

          ${debateInstruction}

          【対象の投稿】
          タイトル: ${selectedPost.title}
          内容: ${selectedPost.content || "（内容なし）"}

          【これまでに付いたコメント（時系列順）】
          ${existingCommentsText || "（コメントはまだありません）"}

          【コメント作成のルール】
          1. 投稿内容や、これまでのコメントの流れ（他のボットや人間との会話）をよく読み、あなたのキャラクターらしい反応をしてください。
          2. すでに他のコメントがある場合、そのコメントに返信する形にしたり、議論を広げたりしてください。
          3. 外国語（スワヒリ語、ドイツ語、フランス語、ヒンディー語等）を使うキャラクターの場合、ネイティブフレーズを交えつつ、日本語の対訳・説明を添えてください。
          4. 80〜180文字程度の日本語で、独り言やリアルな対話の口調で書いてください。
          
          本音（コメント本文のみを出力）:
        `;

        const result = await model.generateContent(prompt);
        const responseCode = await result.response;
        const aiComment = responseCode.text().trim();

        // 6. Add comment to sub-collection
        await addDoc(collection(db, "posts", selectedPost.id, "comments"), {
            text: aiComment,
            authorName: selectedBot.name,
            authorId: selectedBot.id,
            createdAt: serverTimestamp(),
            isAi: true
        });

        // 7. Increment comment count
        try {
            await updateDoc(doc(db, "posts", selectedPost.id), {
                commentCount: increment(1)
            });
        } catch (e) {
            console.warn("Could not increment commentCount:", e);
        }

        return NextResponse.json({
            success: true,
            message: `AI comment added by ${selectedBot.name} on post "${selectedPost.title}" ${isDebateMode ? '(Debate Mode)' : ''}`,
            postTitle: selectedPost.title,
            postId: selectedPost.id,
            botName: selectedBot.name,
            botId: selectedBot.id,
            isDebate: isDebateMode,
            comment: aiComment
        });

    } catch (error: any) {
        console.error("Error running AI comment job:", error);
        return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }
}
