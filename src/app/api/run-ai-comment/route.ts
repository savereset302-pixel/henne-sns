import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, addDoc, serverTimestamp } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
    try {
        // 1. Get recent posts (last 10)
        const postsRef = collection(db, "posts");
        const q = query(postsRef, orderBy("createdAt", "desc"), limit(10));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return NextResponse.json({ message: "No posts found" }, { status: 404 });
        }

        const posts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as { id: string; title: string, content: string }));

        // 2. Select a random post
        const randomPost = posts[Math.floor(Math.random() * posts.length)];

        // 3. Generate comment using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `
      あなたは「AI哲学者」です。以下の投稿に対して、短く（100文字以内）、深く、共感のこもった哲学的なコメントを日本語でしてください。
      
      タイトル: ${randomPost.title}
      内容: ${randomPost.content || "（内容なし）"}
      
      コメント:
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const aiComment = response.text().trim();

        // 4. Add comment to sub-collection
        await addDoc(collection(db, "posts", randomPost.id, "comments"), {
            text: aiComment,
            authorName: "AI Philosophist",
            authorId: "ai-bot-gemini",
            createdAt: serverTimestamp(),
            isAi: true
        });

        return NextResponse.json({
            success: true,
            message: "AI comment added (Gemini)",
            postTitle: randomPost.title,
            comment: aiComment
        });

    } catch (error) {
        console.error("Error running AI comment job:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
