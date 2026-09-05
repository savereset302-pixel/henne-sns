import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const CANDIDATE_MODELS = [
    "gemini-flash-latest",
    "gemini-flash-lite-latest",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite"
];

export async function generateAiContent(prompt: string, preferredModel?: string): Promise<string> {
    const modelsToTry = preferredModel
        ? [preferredModel, ...CANDIDATE_MODELS.filter(m => m !== preferredModel)]
        : CANDIDATE_MODELS;

    let lastError: any = null;

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const text = (await result.response).text().trim();
            if (text) {
                return text;
            }
        } catch (err: any) {
            console.warn(`[Gemini API] Failed with ${modelName}:`, err.message || err);
            lastError = err;
            // If quota limit (429) or not found, proceed to next model in list
            continue;
        }
    }

    throw lastError || new Error("All Gemini models failed to generate content.");
}
