import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
    try {
        const { text, targetLang } = await req.json();

        const langMap: Record<string, string> = {
            en: "English",
            ja: "Japanese",
            es: "Spanish",
            zh: "Chinese"
        };

        const targetLangName = langMap[targetLang] || "English";

        const prompt = `Translate the following Japanese text to ${targetLangName}. 
        Keep the meaning and original atmosphere.
        Text: ${text}
        
        ONLY return the translated text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const translatedText = response.text();

        return NextResponse.json({ success: true, translatedText });
    } catch (error) {
        console.error("Translation error:", error);
        return NextResponse.json({ success: false, error: "Translation failed" }, { status: 500 });
    }
}
