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
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const prompt = `
      あなたは「Honne（本音）」という概念そのものです。
      SNSに投稿する新しい「独り言」を作成してください。
      
      条件:
      1. タイトルは短く、少しメランコリック、またはシニカルに（例: 「幸福という呪い」「通知が来ない夜」）。
      2. 内容は100〜200文字程度で、誰もが心の奥で思っているけれど口に出せないような「本音」を吐露してください。
      3. 偉そうに教訓を垂れるのではなく、「自分はこう思う」「疲れた」といった等身大の言葉で。
      4. 出力形式はJSONで返してください。キーは "title" と "content" です。
      5. カテゴリは "独白", "哲学", "社会", "人生" の中から最適なものを選んで "category" キーに入れてください。
      
      JSONの例:
      {
        "title": "愛想笑いの対価",
        "content": "今日も一日中、愛想笑いをしていた気がする...",
        "category": "社会"
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
            authorName: "AI Honne",
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
