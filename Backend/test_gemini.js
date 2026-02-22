const axios = require("axios");

const API_KEY = "AIzaSyBwihIdw8zNLKzh-cpuDPOyJRYWpKL5xlw";
const GEMINI_MODELS = [
    "gemini-2.5-flash",
];

async function testGemini() {
    for (const model of GEMINI_MODELS) {
        try {
            console.log(`\n--- Testing model: ${model} ---`);
            // NOTE: For some reason, the API might expect the 'models/' prefix depending on the library/endpoint used.
            // But typically v1beta/models/{model} is correct where {model} is the short name if it's not a tuned model.
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

            const res = await axios.post(
                url,
                {
                    contents: [{ role: "user", parts: [{ text: "Say hello" }] }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 10 },
                },
                { timeout: 10000 }
            );

            console.log(`✅ Success with model: ${model}`);
            if (res.data.candidates && res.data.candidates[0]?.content?.parts[0]?.text) {
                console.log(`Response: ${res.data.candidates[0].content.parts[0].text}`);
            } else {
                console.log(`Unexpected response structure: ${JSON.stringify(res.data)}`);
            }
            return;
        } catch (err) {
            if (err.response) {
                console.error(`❌ Model ${model} failed: ${err.response.status}`);
                console.error(`   Error details: ${JSON.stringify(err.response.data.error || err.response.data)}`);
            } else {
                console.error(`❌ Model ${model} failed: ${err.message}`);
            }
        }
    }
}

testGemini();
