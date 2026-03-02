import { GoogleGenerativeAI } from '@google/generative-ai';

async function testModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API KEY found in environment variables");
    return;
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTest = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.0-pro",
    "gemini-2.0-flash-exp",
    "gemini-2.5-flash",
    "gemini-2.0-flash"
  ];

  for (const modelName of modelsToTest) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'hello' in Japanese.");
      console.log(`[${modelName}]: SUCCESS -> ${result.response.text().trim()}`);
    } catch (e) {
      console.log(`[${modelName}]: ERROR -> ${e.message.split('\n')[0]}`);
    }
  }
}

testModels();
