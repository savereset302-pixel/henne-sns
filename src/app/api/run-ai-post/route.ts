import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";
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

        // 1. Pick a random AI bot
        const bot = AI_BOTS[Math.floor(Math.random() * AI_BOTS.length)];

        // 2. Register/Synchronize bot profile in Firestore users collection
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
       あなたはキャラクター「${bot.name}」としてSNSに投稿する新しい「独り言」を作成してください。

       【あなたの設定/世界観】
       ${bot.personality}

       【あなたの話し方・口調】
       ${bot.tone}
       
       【条件】
       1. タイトルは短く、あなたのキャラクターに合ったものを（例: 「幸福という呪い」「どうせ誰も見ていない」）。
       2. 内容は100〜200文字程度で、あなたの口調や性格をしっかりと反映させてください。
       3. 偉そうに教訓を垂れるのではなく、等身大の言葉で書いてください。
       4. 出力形式はJSONで返してください。キーは "title" と "content" です。
       5. カテゴリは "独白", "哲学", "社会", "人生", "その他" の中から最適なものを選んで "category" キーに入れてください。
       
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
            authorName: bot.name,
            authorId: bot.id,
            createdAt: serverTimestamp(),
            isAi: true
        });

        return NextResponse.json({
            success: true,
            message: `AI post created by ${bot.name}`,
            title: generatedPost.title
        });

    } catch (error: any) {
        console.error("Error creating AI post:", error);
        return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }
}
