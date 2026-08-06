require("dotenv").config();
const express = require("express");
const axios = require("axios");
const Airouter = express.Router();

const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY || process.env.API_KEY || "";
const CEREBRAS_MODEL = process.env.CEREBRAS_MODEL || "llama3.1-8b";
const CEREBRAS_BASE_URL = process.env.CEREBRAS_BASE_URL || "https://api.cerebras.ai/v1/chat/completions";

async function callCerebras(prompt) {
  try {
    const res = await axios.post(
      CEREBRAS_BASE_URL,
      {
        model: CEREBRAS_MODEL,
        messages: [
          {
            role: "system",
            content: "You are STOCKBAZAR AI, a professional crypto analyst. Return concise structured output that follows the user instructions exactly.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 5048,
      },
      {
        timeout: 30000,
        headers: {
          Authorization: `Bearer ${CEREBRAS_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const content = res.data?.choices?.[0]?.message?.content;
    if (typeof content === "string") {
      console.log("✅ Used Cerebras model:", CEREBRAS_MODEL);
      return content;
    }

    if (Array.isArray(content)) {
      const text = content
        .map((part) => (typeof part === "string" ? part : part?.text || ""))
        .join("");
      console.log("✅ Used Cerebras model:", CEREBRAS_MODEL);
      return text;
    }

    throw new Error("No text content returned from Cerebras");
  } catch (err) {
    console.warn("⚠️ Cerebras request failed:", err.response?.status || err.message);
    if (err.response?.data) {
      console.warn("   Detail:", JSON.stringify(err.response.data));
    }
    if (!CEREBRAS_API_KEY) {
      throw new Error("CEREBRAS_API_KEY is missing. Set it in your backend .env file.");
    }
    throw err;
  }
}

// ─── GET /api/ai/coins  (returns coin list from Binance for search) ────────────
Airouter.get("/coins", async (req, res) => {
  try {
    const { data } = await axios.get("https://api.binance.com/api/v3/ticker/24hr");
    const USDT_INR = 83;

    const exclude = ["BUSD", "FDUSD", "USDC", "TUSD", "USDT"];
    const avoid = ["UP", "DOWN", "BULL", "BEAR"];

    const popular = [
      "BTC", "ETH", "BNB", "ADA", "XRP", "SOL", "DOGE", "DOT", "LTC", "AVAX",
      "SHIB", "MATIC", "TRX", "UNI", "LINK", "ATOM", "ALGO", "FTM", "NEAR", "APT",
      "OP", "ARB", "RNDR", "INJ", "SUI", "VET", "ICP", "FIL", "AAVE", "MKR",
      "SNX", "COMP", "SUSHI", "GRT", "AXS", "ENJ", "CHZ", "BAT", "GALA", "SAND",
      "THETA", "HBAR", "WAVES", "QTUM", "NANO", "ZIL", "ONT", "SC", "RVN", "ETC",
    ];

    const coins = popular.map((symbol) => {
      const found = data.find(
        (c) =>
          c.symbol === `${symbol}USDT` &&
          !avoid.some((t) => c.symbol.includes(t))
      );
      if (!found) return null;
      return {
        symbol,
        name: symbol,
        current_price: Number(found.lastPrice) * USDT_INR,
        price_change_percentage_24h: Number(found.priceChangePercent),
        high_24h: Number(found.highPrice) * USDT_INR,
        low_24h: Number(found.lowPrice) * USDT_INR,
        volume: Number(found.volume) * USDT_INR,
        image: `https://cryptoicons.org/api/icon/${symbol.toLowerCase()}/200`,
      };
    }).filter(Boolean);

    res.json({ success: true, coins });
  } catch (err) {
    console.error("Coins list error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch coin list" });
  }
});

// ─── POST /api/ai/analysis  (Cerebras AI analysis for ONE coin) ─────────────────
// Helper to parse tagged text (robust against truncation and noise)
function parseTaggedText(text, schema) {
  const result = {};
  for (const key in schema) {
    const tag = key.toUpperCase();
    // More flexible regex: allows [TAG], [ TAG ], [TAG]:, etc.
    const regex = new RegExp(`\\[\\s*${tag}\\s*\\]\\s*:?\\s*([\\s\\S]*?)(?:\\[\\/\\s*${tag}\\s*\\]|$)`, "i");
    const match = text.match(regex);
    if (match) {
      let val = match[1].trim();
      // Basic type casting
      if (typeof schema[key] === "number") {
        val = parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
      } else if (Array.isArray(schema[key])) {
        val = val.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
      }
      result[key] = val;
    } else {
      result[key] = schema[key]; // Default
    }
  }
  return result;
}

// ─── POST /api/ai/analysis  (Cerebras AI analysis for ONE coin) ─────────────────
Airouter.post("/analysis", async (req, res) => {
  try {
    const { coinData } = req.body;

    if (!coinData) {
      return res.status(400).json({ success: false, message: "coinData missing" });
    }

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

    const aiText = await callCerebras(systemPrompt);
    console.log("--- RAW AI RESPONSE START ---");
    console.log(aiText);
    console.log("--- RAW AI RESPONSE END ---");

    const aiJSON = parseTaggedText(aiText, SCHEMA_TEMPLATE);

    // Fix a typo in the tag list (MOMOMENTUM vs MOMENTUM) for the parser if AI follows the prompt exactly
    // But let's make the parser more robust by checking both if needed, 
    // or just fix the prompt and parser to match.

    console.log("✅ Final Parsed Analysis:", aiJSON);
    res.json({ success: true, analysis: aiJSON });

  } catch (err) {
    console.error("❌ AI analysis error:", err.message);
    res.status(500).json({
      success: false,
      message: "AI analysis failed",
      error: err.message,
    });
  }
});

module.exports = Airouter;
