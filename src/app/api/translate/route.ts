import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { text, targetLang, texts } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Translation Error: GEMINI_API_KEY is not set.");
            return NextResponse.json({ success: false, error: "Configuration Error" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Using gemini-1.5-flash which is widely supported
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const langMap: Record<string, string> = {
            en: "English",
            ja: "Japanese",
            es: "Spanish",
            zh: "Chinese"
        };

        const targetLangName = langMap[targetLang] || "English";

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        ];

        if (texts && Array.isArray(texts)) {
            // Bulk translation request
            const prompt = `Translate the following list of Japanese items to ${targetLangName}. 
            Return the result as a JSON array of objects with "id", "title" and "content" fields.
            Keep the meaning and original atmosphere.
            
            Items:
            ${JSON.stringify(texts)}
            
            Return ONLY the valid JSON array starting with [ and ending with ]. No Markdown code blocks. No other text.`;

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                safetySettings
            });
            const response = await result.response;
            const textResponse = response.text().trim();

            // Extract JSON if wrapped in markdown
            const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
            const cleanJSON = jsonMatch ? jsonMatch[0] : textResponse;

            try {
                const translatedItems = JSON.parse(cleanJSON);
                return NextResponse.json({ success: true, translatedItems });
            } catch (e) {
                console.error("Bulk Translation JSON Parse error:", e, "Response was:", textResponse);
                return NextResponse.json({ success: false, error: "Parsing failed" }, { status: 500 });
            }
        }

        // Single text translation
        const prompt = `Translate the following Japanese text to ${targetLangName}. 
        Keep the meaning and original atmosphere.
        Text: ${text}
        
        ONLY return the translated text.`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            safetySettings
        });
        const response = await result.response;
        const translatedText = response.text().trim();

        return NextResponse.json({ success: true, translatedText });
    } catch (error: any) {
        console.error("Global Translation error:", error);
        return NextResponse.json({ success: false, error: error?.message || "Translation failed" }, { status: 500 });
    }
}
