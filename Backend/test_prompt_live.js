const axios = require("axios");

const API_KEY = "AIzaSyBwihIdw8zNLKzh-cpuDPOyJRYWpKL5xlw";
const GEMINI_MODELS = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-8b"];

const coinData = {
    symbol: "BTC",
    name: "Bitcoin",
    current_price: 8200000,
    price_change_percentage_24h: 2.5,
    high_24h: 8300000,
    low_24h: 8100000,
    volume: 500000000
};

const SCHEMA_TEMPLATE = {
    summary_beginner: "No summary available.",
    summary_advanced: "No technical summary available.",
    trend: "Neutral",
    trend_score: 50,
    momentum: "Neutral",
    volatility: "Low",
    support: "N/A",
    resistance: "N/A",
    stop_loss: "N/A",
    take_profit: "N/A",
    sentiment: "Neutral",
    whale_activity: "Neutral",
    pattern: "None",
    prediction_24h: "N/A",
    prediction_7d: "N/A",
    risk: "Medium",
    confidence: 50,
    grade: "C",
    buy_signal: "Hold",
    key_levels: []
};

function parseTaggedText(text, schema) {
    const result = {};
    for (const key in schema) {
        const tag = key.toUpperCase();
        const regex = new RegExp(`\\[\\s*${tag}\\s*\\]\\s*:?\\s*([\\s\\S]*?)(?:\\[\\/\\s*${tag}\\s*\\]|$)`, "i");
        const match = text.match(regex);
        if (match) {
            let val = match[1].trim();
            if (typeof schema[key] === "number") {
                val = parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
            } else if (Array.isArray(schema[key])) {
                val = val.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
            }
            result[key] = val;
        } else {
            result[key] = schema[key];
        }
    }
    return result;
}

const systemPrompt = `
You are STOCKBAZAR AI — a professional crypto analyst.
Analyze the provided coin data and generate a comprehensive analysis.
IMPORTANT: You MUST provide values for EVERY tag listed below. Do not stop until all tags are filled.

RULES:
- Wrap every value in its designated tag: [TAG]value[/TAG].
- If you are unsure, provide your best professional estimate based on the data.
- Keep values concise to avoid hitting output limits.

REQUIRED TAGS (IN ORDER):
1. [SUMMARY_BEGINNER] - A simple, 2-sentence explanation for a novice trader.
2. [SUMMARY_ADVANCED] - A technical, data-driven summary for an experienced trader.
3. [TREND] - Overall direction (Bullish/Bearish/Neutral).
4. [TREND_SCORE] - Numerical score from 0-100.
5. [MOMENTUM] - Strength of the trend (e.g., Strong Up, Weakening).
6. [VOLATILITY] - Price fluctuation level (High/Medium/Low).
7. [SUPPORT] - Primary price support level in INR (e.g., ₹85,000).
8. [RESISTANCE] - Primary resistance level in INR (e.g., ₹95,000).
9. [STOP_LOSS] - Recommended stop loss level in INR.
10. [TAKE_PROFIT] - Primary target profit level in INR.
11. [SENTIMENT] - Market psychology (Bullish/Fearful/Greedy).
12. [WHALE_ACTIVITY] - Large holder behavior (Accumulation/Distribution).
13. [PATTERN] - Chart pattern if any (e.g., Breakout).
14. [PREDICTION_24H] - Short term price expectation.
15. [PREDICTION_7D] - Weekly outlook.
16. [RISK] - Overall risk assessment (High/Medium/Low).
17. [CONFIDENCE] - Your certainty level 0-100.
18. [GRADE] - Investment grade (A+, A, B, C, D, F).
19. [BUY_SIGNAL] - Clear action (Strong Buy/Buy/Hold/Sell).
20. [KEY_LEVELS] - List minor support/resistance prices, comma-separated.

COIN DATA:
${JSON.stringify(coinData)}
`;

async function test() {
    for (const model of GEMINI_MODELS) {
        try {
            console.log(`Testing model: ${model}`);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
            const res = await axios.post(url, {
                contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
            });
            const text = res.data.candidates[0].content.parts[0].text;
            console.log("--- RAW RESPONSE ---");
            console.log(text);
            console.log("--------------------");
            const parsed = parseTaggedText(text, SCHEMA_TEMPLATE);
            console.log("--- PARSED RESPONSE ---");
            console.log(parsed);
            return;
        } catch (err) {
            console.error(`Model ${model} failed:`, err.message);
        }
    }
}

test();
