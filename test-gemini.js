const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    try {
        const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent("test");
        console.log("Success with gemini-1.5-flash");
    } catch (e) {
        console.error("Failed with gemini-1.5-flash:", e.message);
    }

    try {
        const result = await genAI.getGenerativeModel({ model: "gemini-pro" }).generateContent("test");
        console.log("Success with gemini-pro");
    } catch (e) {
        console.error("Failed with gemini-pro:", e.message);
    }
}

listModels();
