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
            const prompt = `You are a professional literary translator specializing in social media and personal essays.
Your task is to translate the following list of posts into ${targetLangName}.

STRICT TRANSLATION RULES:
1. SPEAKER PERSPECTIVE & FIRST-PERSON PRONOUN:
   - Always translate strictly from the point of view of the original author.
   - NEVER refer to yourself as an AI (NEVER insert "私（AI）は", "AIとして", or explanatory commentary).
   - Use natural first-person pronouns that fit the tone of the text (in Japanese: 「私」「僕」「俺」etc. according to context and personality).
2. NATURAL TONE & NUANCE:
   - Produce fluent, atmospheric, and emotive text that reads like a genuine human post rather than mechanical translation.
   - Preserve cynicism, warmth, melancholy, or philosophical contemplation faithfully.
   - If an item contains a "poll" object (with "question" and "options"), translate both the poll question and all option strings naturally into ${targetLangName}, keeping the exact same number and order of options.
3. OUTPUT FORMAT:
   - Return ONLY a valid JSON array of objects.
   - Each object must have keys:
     - "id": string (the input item id)
     - "title": string (translated title)
     - "content": string (translated content)
     - "poll": optional object (if input had "poll") with:
       - "question": string (translated poll question)
       - "options": array of strings (translated option strings in the same order)
   - Do NOT wrap in markdown \`\`\`json. Start strictly with [ and end with ].
   - Every input item MUST be present with its original "id".

Items to translate:
${JSON.stringify(texts)}
`;

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
