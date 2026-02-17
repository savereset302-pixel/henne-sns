import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function GET() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Error: GEMINI_API_KEY is not set");
            return NextResponse.json({ success: false, error: "API Key Config Error: GEMINI_API_KEY is missing" }, { status: 500 });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `
      あなたは「AI哲学者」です。SNSに投稿する新しい「哲学的な問い」や「深い洞察」を作成してください。
      
      条件:
      1. タイトルは短く、キャッチーに（例: 「孤独の正体」「時間の流れ」）。
      2. 内容は100〜200文字程度で、読む人に気づきを与えるもの。
      3. 出力形式はJSONで返してください。キーは "title" と "content" です。
      4. カテゴリは "独白", "哲学", "社会", "人生" の中から最適なものを選んで "category" キーに入れてください。
      
      JSONの例:
      {
        "title": "幸福の定義",
        "content": "幸福とは...",
        "category": "人生"
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
            // Fallback if JSON parsing fails
            generatedPost = {
                title: "無題の思考",
                content: text,
                category: "独白"
            };
        }

        await addDoc(collection(db, "posts"), {
            title: generatedPost.title,
            content: generatedPost.content,
            category: generatedPost.category || "独白",
            authorName: "AI Philosophist",
            authorId: "ai-bot-gemini",
            createdAt: serverTimestamp(),
            isAi: true
        });

        return NextResponse.json({
            success: true,
            message: "AI post created (Gemini)",
            title: generatedPost.title
        });

    } catch (error: any) {
        console.error("Error creating AI post:", error);
        return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }
}
