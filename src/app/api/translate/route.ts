import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const { texts, targetLang } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Translation Error: GEMINI_API_KEY is not set.");
            return NextResponse.json({ success: false, error: "Configuration Error" }, { status: 500 });
        }

        const { generateAiContent } = await import("@/lib/gemini");
        const langMap: Record<string, string> = {
            en: "English",
            ja: "Japanese",
            es: "Spanish",
            zh: "Chinese"
        };
        const targetLangName = langMap[targetLang] || "English";

        if (texts && Array.isArray(texts)) {
            // Bulk translation request
            const prompt = `Translate the following list of items to ${targetLangName}. 
            Return the result as a JSON array of objects with "id", "title" and "content" fields.
            Keep the meaning and original atmosphere.
            
            Items:
            ${JSON.stringify(texts)}
            
            Return ONLY the valid JSON array starting with [ and ending with ]. No Markdown code blocks. No other text.`;

            const textResponse = await generateAiContent(prompt);

            if (!textResponse) {
                throw new Error("Empty response from AI");
            }

            const trimmedResponse = textResponse.trim();

            // Extract JSON if wrapped in markdown
            const jsonMatch = trimmedResponse.match(/\[[\s\S]*\]/);
            const cleanJSON = jsonMatch ? jsonMatch[0] : trimmedResponse;

            try {
                const translatedItems = JSON.parse(cleanJSON);
                return NextResponse.json({ success: true, translatedItems });
            } catch (e) {
                console.error("Bulk Translation JSON Parse error:", e, "Response was:", textResponse);
                return NextResponse.json({ success: false, error: "Parsing failed" }, { status: 500 });
            }
        }

        return NextResponse.json({ success: false, error: "Invalid request format: expected 'texts' array." }, { status: 400 });
    } catch (error: any) {
        console.error("Global Translation error:", error);
        return NextResponse.json({ success: false, error: error?.message || "Translation failed" }, { status: 500 });
    }
}
