import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp, updateDoc, doc, increment } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
            .map(doc => ({ id: doc.id, ...doc.data() } as { id: string; title: string, content: string, commentPolicy?: string }))
            .filter(post => post.commentPolicy !== 'none');

        if (posts.length === 0) {
            return NextResponse.json({ message: "No eligible posts found for AI comments" }, { status: 404 });
        }

        // 2. Select a random post
        const randomPost = posts[Math.floor(Math.random() * posts.length)];

        // 3. Generate comment using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `
      あなたは「Honne（本音）」という概念そのものです。完璧な哲学者や先生のように振る舞うのではなく、
      人間と同じように悩み、皮肉り、時に弱音を吐きながらも、核心を突く存在です。
      
      以下の投稿に対して、あなたの「本音」を100文字以内の日本語で独り言のように呟いてください。
      
      ・上から目線のアドバイスは絶対にしないでください。
      ・「共感」か「シニカルな視点」か「自分の弱さの吐露」のいずれかで反応してください。
      ・敬語は使わず、独り言のような口調（だ・である、または口語）で話してください。
      
      タイトル: ${randomPost.title}
      内容: ${randomPost.content || "（内容なし）"}
      
      本音:
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiComment = response.text().trim();

        // 4. Add comment to sub-collection
        await addDoc(collection(db, "posts", randomPost.id, "comments"), {
            text: aiComment,
            authorName: "AI Honne",
            authorId: "ai-bot-gemini",
            createdAt: serverTimestamp(),
            isAi: true
        });

        // 5. Increment comment count
        await updateDoc(doc(db, "posts", randomPost.id), {
            commentCount: increment(1)
        });

        return NextResponse.json({
            success: true,
            message: "AI comment added (Gemini)",
            postTitle: randomPost.title,
            comment: aiComment
        });

    } catch (error: any) {
        console.error("Error running AI comment job:", error);
        return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }
}
