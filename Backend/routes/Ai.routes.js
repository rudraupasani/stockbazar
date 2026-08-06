require("dotenv").config();
const express = require("express");
const axios = require("axios");
const Airouter = express.Router();

const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const CEREBRAS_MODEL = process.env.CEREBRAS_MODEL;
const CEREBRAS_BASE_URL = process.env.CEREBRAS_BASE_URL;

let USD_INR = 83;

// Update USD → INR periodically
async function updateUSDtoINR() {
  try {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr"
    );
    if (data && data.tether && data.tether.inr) {
      USD_INR = data.tether.inr;
    }
  } catch (err) {
    // silently use fallback
  }
}
updateUSDtoINR();
setInterval(updateUSDtoINR, 300000);

async function fallbackAnalysis(coinData) {
  const price = Number(coinData?.current_price || 0);
  const change = Number(coinData?.price_change_percentage_24h || 0);
  const support = Math.max(0, price * 0.96);
  const resistance = price * 1.04;
  const stopLoss = Math.max(0, price * 0.94);
  const takeProfit = price * 1.08;

  return {
    summary_beginner: `${coinData?.name || "This coin"} is currently trading at ${price ? `₹${price.toLocaleString()}` : "a live price"}. The 24h move of ${change.toFixed(1)}% suggests ${change >= 0 ? "buyers are active" : "selling pressure remains present"}.`,
    summary_advanced: `${coinData?.symbol || "Coin"} is showing ${change >= 0 ? "a constructive short-term bias" : "a cautious short-term bias"} with price action anchored around the current market level.`,
    trend: change >= 0 ? "Bullish" : "Bearish",
    trend_score: Math.min(100, Math.max(40, 50 + change * 2)),
    momentum: change >= 0 ? "Moderate Up" : "Moderate Down",
    volatility: Math.abs(change) > 5 ? "High" : Math.abs(change) > 2 ? "Medium" : "Low",
    support: `₹${support.toLocaleString()}`,
    resistance: `₹${resistance.toLocaleString()}`,
    stop_loss: `₹${stopLoss.toLocaleString()}`,
    take_profit: `₹${takeProfit.toLocaleString()}`,
    sentiment: change >= 0 ? "Bullish" : "Fearful",
    whale_activity: change >= 0 ? "Accumulation" : "Distribution",
    pattern: change >= 0 ? "Breakout" : "Pullback",
    prediction_24h: `₹${(price + (price * (change >= 0 ? 0.01 : -0.01))).toLocaleString()}`,
    prediction_7d: `₹${(price + (price * (change >= 0 ? 0.03 : -0.03))).toLocaleString()}`,
    risk: Math.abs(change) > 5 ? "High" : Math.abs(change) > 2 ? "Medium" : "Low",
    confidence: 72,
    grade: change >= 0 ? "B" : "C",
    buy_signal: change >= 0 ? "Buy" : "Hold",
    key_levels: [`₹${support.toLocaleString()}`, `₹${resistance.toLocaleString()}`],
  };
}

async function callCerebras(prompt) {
  if (!CEREBRAS_API_KEY) {
    throw new Error("CEREBRAS_API_KEY is missing. Set it in your backend .env file.");
  }

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
    throw err;
  }
}

const popularMap = [
  { symbol: "BTC", krakenPair: "XXBTZUSD", name: "Bitcoin" },
  { symbol: "ETH", krakenPair: "XETHZUSD", name: "Ethereum" },
  { symbol: "BNB", krakenPair: "BNBUSD", name: "BNB" },
  { symbol: "XRP", krakenPair: "XXRPZUSD", name: "XRP" },
  { symbol: "ADA", krakenPair: "ADAUSD", name: "Cardano" },
  { symbol: "DOGE", krakenPair: "XDGUSD", name: "Dogecoin" },
  { symbol: "SOL", krakenPair: "SOLUSD", name: "Solana" },
  { symbol: "DOT", krakenPair: "DOTUSD", name: "Polkadot" },
  { symbol: "TRX", krakenPair: "TRXUSD", name: "TRON" },
  { symbol: "LTC", krakenPair: "XLTCZUSD", name: "Litecoin" },
  { symbol: "SHIB", krakenPair: "SHIBUSD", name: "Shiba Inu" },
  { symbol: "AVAX", krakenPair: "AVAXUSD", name: "Avalanche" },
  { symbol: "UNI", krakenPair: "UNIUSD", name: "Uniswap" },
  { symbol: "LINK", krakenPair: "LINKUSD", name: "Chainlink" },
  { symbol: "ATOM", krakenPair: "ATOMUSD", name: "Cosmos" },
  { symbol: "MATIC", krakenPair: "POLUSD", name: "Polygon" },
  { symbol: "NEAR", krakenPair: "NEARUSD", name: "NEAR Protocol" },
  { symbol: "FIL", krakenPair: "FILUSD", name: "Filecoin" },
  { symbol: "APT", krakenPair: "APTUSD", name: "Aptos" },
  { symbol: "ARB", krakenPair: "ARBUSD", name: "Arbitrum" },
  { symbol: "OP", krakenPair: "OPUSD", name: "Optimism" },
  { symbol: "SUI", krakenPair: "SUIUSD", name: "Sui" },
  { symbol: "ICP", krakenPair: "ICPUSD", name: "Internet Computer" },
  { symbol: "AAVE", krakenPair: "AAVEUSD", name: "Aave" },
  { symbol: "GRT", krakenPair: "GRTUSD", name: "The Graph" },
  { symbol: "SAND", krakenPair: "SANDUSD", name: "The Sandbox" },
  { symbol: "MANA", krakenPair: "MANAUSD", name: "Decentraland" },
  { symbol: "GALA", krakenPair: "GALAUSD", name: "Gala" },
  { symbol: "HBAR", krakenPair: "HBARUSD", name: "Hedera" },
  { symbol: "VET", krakenPair: "VETUSD", name: "VeChain" },
];

// ─── GET /api/ai/coins  (returns coin list from Kraken for search) ────────────
Airouter.get("/coins", async (req, res) => {
  try {
    const pairs = popularMap.map((c) => c.krakenPair).join(",");
    const { data } = await axios.get(`https://api.kraken.com/0/public/Ticker?pair=${pairs}`);
    const assets = data.result;

    const coins = popularMap.map((coin) => {
      const found = assets[coin.krakenPair];
      if (!found) return null;

      const price = Number(found.c[0]);
      const open = Number(found.o);
      const change24h = open > 0 ? ((price - open) / open) * 100 : 0;
      const volumeUsd = Number(found.v[1]) * price;

      return {
        symbol: coin.symbol,
        name: coin.name,
        current_price: price * USD_INR,
        price_change_percentage_24h: Number(change24h.toFixed(2)),
        high_24h: Number(found.h[1]) * USD_INR,
        low_24h: Number(found.l[1]) * USD_INR,
        volume: volumeUsd * USD_INR,
        image: `https://cryptoicons.org/api/icon/${coin.symbol.toLowerCase()}/200`,
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

    let aiText = "";
    let aiJSON = null;

    try {
      aiText = await callCerebras(systemPrompt);
      console.log("--- RAW AI RESPONSE START ---");
      console.log(aiText);
      console.log("--- RAW AI RESPONSE END ---");
      aiJSON = parseTaggedText(aiText, SCHEMA_TEMPLATE);
    } catch (fallbackErr) {
      console.warn("Falling back to local analysis response.", fallbackErr.message);
      aiJSON = await fallbackAnalysis(coinData);
    }

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
