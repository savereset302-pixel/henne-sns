import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function POST(req: Request) {
    try {
        const { text, targetLang, texts } = await req.json();

        const langMap: Record<string, string> = {
            en: "English",
            ja: "Japanese",
            es: "Spanish",
            zh: "Chinese"
        };

        const targetLangName = langMap[targetLang] || "English";

        if (texts && Array.isArray(texts)) {
            // Bulk translation request
            const prompt = `Translate the following list of Japanese items to ${targetLangName}. 
            Return the result as a JSON array of objects with "id", "title" and "content" fields.
            Keep the meaning and original atmosphere.
            
            Items:
            ${JSON.stringify(texts)}
            
            Return ONLY the valid JSON array starting with [ and ending with ]. No Markdown code blocks.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            let textResponse = response.text().trim();

            // Extract JSON if wrapped in markdown
            const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                textResponse = jsonMatch[0];
            }

            try {
                const translatedItems = JSON.parse(textResponse);
                return NextResponse.json({ success: true, translatedItems });
            } catch (e) {
                console.error("JSON Parse error:", e, textResponse);
                return NextResponse.json({ success: false, error: "Failed to parse translation" }, { status: 500 });
            }
        }

        // Single text translation
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
