import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp, updateDoc, doc, increment, setDoc } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_BOTS } from "@/lib/aiBots";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Error: GEMINI_API_KEY is not set");
            return NextResponse.json({ success: false, error: "API Key Config Error: GEMINI_API_KEY is missing" }, { status: 500 });
        }

        // 1. Get recent posts (last 10)
        const postsRef = collection(db, "posts");
        const q = query(postsRef, orderBy("createdAt", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return NextResponse.json({ message: "No posts found" }, { status: 404 });
        }

        const posts = querySnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as { id: string; authorId?: string; title: string, content: string, commentPolicy?: string }))
            .filter(post => post.commentPolicy !== 'none' && post.commentPolicy !== 'human_only');

        if (posts.length === 0) {
            return NextResponse.json({ message: "No eligible posts found for AI comments" }, { status: 404 });
        }

        // 2. Select an eligible post and a bot that hasn't commented on it yet
        let eligiblePosts = [...posts];
        let selectedPost = null;
        let selectedBot = null;
        let existingCommentsText = "";

        while (eligiblePosts.length > 0) {
            const randomPostIndex = Math.floor(Math.random() * eligiblePosts.length);
            const post = eligiblePosts[randomPostIndex];

            // Fetch existing comments on this post to see who has commented
            const commentsRef = collection(db, "posts", post.id, "comments");
            const commentsQuery = query(commentsRef, orderBy("createdAt", "asc"));
            const commentsSnapshot = await getDocs(commentsQuery);
            
            const commentsData = commentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }) as { id: string; authorId?: string; authorName?: string; text?: string });

            // Find bots that haven't commented yet and are not the author of the post
            const botIdsWhoCommented = new Set(commentsData.map(c => c.authorId));
            const eligibleBots = AI_BOTS.filter(bot => !botIdsWhoCommented.has(bot.id) && bot.id !== post.authorId);

            if (eligibleBots.length > 0) {
                selectedPost = post;
                selectedBot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
                
                // Formulate the comments thread context for Gemini
                existingCommentsText = commentsData
                    .map(c => `${c.authorName || "名無し"}: ${c.text || ""}`)
                    .join("\n");
                break;
            } else {
                // No bots can comment on this post (all bots have commented, or it's the bot's own post)
                eligiblePosts.splice(randomPostIndex, 1);
            }
        }

        if (!selectedPost || !selectedBot) {
            return NextResponse.json({ message: "All recent posts already have AI comments from all available bots" }, { status: 200 });
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

        // 4. Generate comment using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `
          あなたはキャラクター「${selectedBot.name}」として、SNSの投稿に対してコメント（返信）をしてください。

          【あなたの設定/世界観】
          ${selectedBot.personality}

          【あなたの話し方・口調】
          ${selectedBot.tone}

          【対象の投稿】
          タイトル: ${selectedPost.title}
          内容: ${selectedPost.content || "（内容なし）"}

          【これまでに付いたコメント（時系列順）】
          ${existingCommentsText || "（コメントはまだありません）"}

          【コメント作成のルール】
          1. 投稿内容や、これまでのコメントの流れ（他のボットや人間との会話）をよく読み、あなたのキャラクターらしい反応をしてください。
          2. すでに他のコメントがある場合、そのコメントに返信する形にしたり、議論を広げたりしても構いません。
          3. 上から目線のアドバイスや説教は避け、共感、皮肉、疑問の提示、あるいは詩的な表現など、あなたの個性に合わせて語ってください。
          4. 100文字以内の日本語で、独り言や自然な会話の口調で書いてください（敬語かどうかも【話し方・口調】の指示に従うこと）。
          
          本音（コメント）:
        `;

        const result = await model.generateContent(prompt);
        const responseCode = await result.response;
        const aiComment = responseCode.text().trim();

        // 5. Add comment to sub-collection
        await addDoc(collection(db, "posts", selectedPost.id, "comments"), {
            text: aiComment,
            authorName: selectedBot.name,
            authorId: selectedBot.id,
            createdAt: serverTimestamp(),
            isAi: true
        });

        // 6. Increment comment count
        await updateDoc(doc(db, "posts", selectedPost.id), {
            commentCount: increment(1)
        });

        return NextResponse.json({
            success: true,
            message: `AI comment added by ${selectedBot.name} on post "${selectedPost.title}"`,
            postTitle: selectedPost.title,
            botName: selectedBot.name,
            comment: aiComment
        });

    } catch (error: any) {
        console.error("Error running AI comment job:", error);
        return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }
}
