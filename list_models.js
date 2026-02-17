const fs = require('fs');

async function listModels() {
    try {
        const envContent = fs.readFileSync('.env.local', 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);

        if (!match || !match[1]) {
            console.log("No API Key found in .env.local");
            return;
        }

        const apiKey = match[1].trim();
        console.log("Using API Key:", apiKey.substring(0, 5) + "...");

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log("Available Generative Models:");
            data.models.forEach(model => {
                if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${model.name} (${model.displayName})`);
                }
            });
        } else {
            console.log("Error response:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
