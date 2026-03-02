const fetch = require('node-fetch');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("AVAILABLE MODELS:", data.models.map(m => m.name).filter(name => name.includes("gemini")));
  } catch (e) {
    console.error("ERROR", e.message);
  }
}

listModels();
