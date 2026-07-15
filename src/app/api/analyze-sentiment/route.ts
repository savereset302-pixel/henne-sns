import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const { content } = await req.json();

        if (!content) {
            return NextResponse.json({ success: false, error: "Content is required" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Sentiment Error: GEMINI_API_KEY is not set.");
            return NextResponse.json({ success: false, error: "Configuration Error" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      以下の文章の「感情」を分析し、指定された4つのカテゴリーの中から最も近いものを1つだけ選んで返してください。
      返信はカテゴリー名のみ（1単語）にしてください。解説は不要です。

      カテゴリー:
      1. sadness (悲しみ・憂鬱)
      2. anger (怒り・フラストレーション)
      3. fatigue (虚無・疲れ)
      4. joy (喜び・希望)

      文章: "${content}"

      カテゴリー:
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const sentiment = response.text().trim().toLowerCase();

        // Mapping to ensure it returns valid category
        const validSentiments = ["sadness", "anger", "fatigue", "joy"];
        const finalSentiment = validSentiments.find(s => sentiment.includes(s)) || "none";

        return NextResponse.json({ success: true, sentiment: finalSentiment });

    } catch (error: any) {
        console.error("Error analyzing sentiment:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
