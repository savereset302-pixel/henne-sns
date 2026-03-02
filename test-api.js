const fetch = require('node-fetch');

async function testApi(version, modelName) {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello' }] }]
      })
    });
    const data = await response.json();
    console.log(`[${version}] [${modelName}]:`, response.status, data.error ? data.error.message : 'SUCCESS');
  } catch (e) {
    console.error(`[${version}] [${modelName}]: ERROR`, e.message);
  }
}

async function runTests() {
  const versions = ['v1', 'v1beta'];
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'];
  
  for (const v of versions) {
    for (const m of models) {
      await testApi(v, m);
    }
  }
}

runTests();
