import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { text, targetLang, texts } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Translation Error: GEMINI_API_KEY is not set.");
            return NextResponse.json({ success: false, error: "Configuration Error" }, { status: 500 });
        }

        const langMap: Record<string, string> = {
            en: "English",
            ja: "Japanese",
            es: "Spanish",
            zh: "Chinese"
        };

        const targetLangName = langMap[targetLang] || "English";

        // Helper function to call Gemini via REST API
        const callGemini = async (promptText: string) => {
            // Using v1beta for gemini-1.5-flash which is widely supported
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }],
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
                    ],
                    generationConfig: {
                        temperature: 0.2,
                        topP: 0.8,
                        topK: 40,
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Gemini API Error:", response.status, errorData);
                throw new Error(errorData?.error?.message || `Gemini API returned ${response.status}`);
            }

            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        };

        if (texts && Array.isArray(texts)) {
            // Bulk translation request
            const prompt = `Translate the following list of Japanese items to ${targetLangName}. 
            Return the result as a JSON array of objects with "id", "title" and "content" fields.
            Keep the meaning and original atmosphere.
            
            Items:
            ${JSON.stringify(texts)}
            
            Return ONLY the valid JSON array starting with [ and ending with ]. No Markdown code blocks. No other text.`;

            const textResponse = await callGemini(prompt);
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
