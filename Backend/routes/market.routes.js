const express = require("express");
const axios = require("axios");
const WebSocket = require("ws");
const router = express.Router();

let USDT_INR = 83;

// 🔹 Update USDT → INR every 5 min
async function updateUSDTtoINR() {
  try {
    const res = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr"
    );
    USDT_INR = res.data.tether.inr;
    console.log("💱 Updated USDT → INR:", USDT_INR);
  } catch (err) {
    console.log("❌ Failed to fetch USDT → INR, using fallback:", USDT_INR);
  }
}
updateUSDTtoINR();
setInterval(updateUSDTtoINR, 300000);

// 🔹 Major coins
const majorCoins = [
  "BTC", "ETH", "BNB", "XRP", "ADA", "DOGE", "SOL", "DOT", "MATIC", "DAI",
  "TRX", "LTC", "SHIB", "AVAX", "UNI", "WBTC", "LEO", "LINK", "ATOM", "XLM",
  "XMR", "OKB", "ETC", "BCH", "FIL", "APE", "ALGO", "NEAR", "QNT", "HBAR",
  "VET", "FLOW", "LUNC", "LDO", "MANA", "ICP", "EOS", "CHZ", "AXS", "XTZ",
  "SAND", "THETA", "KCS", "BTT", "EGLD", "BSV", "USDP", "AAVE", "ZEC", "GRT",
  "FTM", "MKR", "SNX", "COMP", "SUSHI", "AXS", "ENJ", "BAT", "WAVES", "QTUM",
  "NANO", "ZIL", "ONT", "SC", "RVN", "DGB", "HOT", "KAVA", "XEM", "LRC",
  "CELO", "HNT", "GLM", "ANKR", "STX", "AR", "MINA", "KLAY", "GALA", "XDC",
  "CVC", "IOST", "ZEN", "LPT", "RSR", "BAL", "OCEAN", "NEXO", "SRM", "BNT",
  "DCR", "WAXP", "XVG"
];
const exclude = ["BUSD", "FDUSD", "USDC", "TUSD"];
const avoid = ["UP", "DOWN", "BULL", "BEAR"];
const fallbackImage = "https://via.placeholder.com/40?text=?";

// 🔹 Helper to fetch Binance 24h data
async function fetchBinanceData() {
  const { data } = await axios.get("https://api.binance.com/api/v3/ticker/24hr");
  return data;
}

async function getPriceChange(symbol, interval) {
  let binInterval;
  let limit;
  if (interval === "1h") {
    binInterval = "1h";
    limit = 2; // 2 candles: start and end
  } else if (interval === "7d") {
    binInterval = "1d";
    limit = 8; // 7 days + 1
  } else return 0;

  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${binInterval}&limit=${limit}`;
  const { data } = await axios.get(url);

  if (!data || !data.length) return 0;

  const firstClose = Number(data[0][4]);
  const lastClose = Number(data[data.length - 1][4]);

  return ((lastClose - firstClose) / firstClose) * 100;
}

// 🔹 Route: /top-gainers (all major coins)
router.get("/top-gainers", async (req, res) => {
  try {
    const data = await fetchBinanceData();

    const result = await Promise.all(
      majorCoins.map(async (coin) => {
        const found = data.find(
          (c) =>
            c.symbol === `${coin}USDT` &&
            !exclude.some((f) => c.symbol.endsWith(f)) &&
            !avoid.some((t) => c.symbol.includes(t))
        );
        if (!found) return null;

        const change1h = await getPriceChange(coin, "1h");
        const change7d = await getPriceChange(coin, "7d");


        return {
          id: found.symbol,
          symbol: coin,
          name: coin,
          current_price: Number(found.lastPrice) * USDT_INR,
          price_change_percentage_1h: Number(change1h.toFixed(2)),
          price_change_percentage_24h: Number(found.priceChangePercent),
          price_change_percentage_7d: Number(change7d.toFixed(2)),
          high_24h: Number(found.highPrice) * USDT_INR,
          low_24h: Number(found.lowPrice) * USDT_INR,
          volume: Number(found.volume) * USDT_INR,
          image: `https://cryptoicons.org/api/icon/${coin}/200`,
        };
      })
    );

    res.json({ success: true, gainers: result.filter(Boolean) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch top gainers" });
  }
});

// 🔹 /s /top-movers (gainers + losers)
router.get("/top-movers", async (req, res) => {
  try {
    const data = await fetchBinanceData();
    const coinsData = majorCoins.map(coin => {
      const found = data.find(
        c => c.symbol === `${coin}USDT` &&
          !exclude.some(f => c.symbol.endsWith(f)) &&
          !avoid.some(t => c.symbol.includes(t))
      );
      if (!found) return null;
      return {
        id: found.symbol,
        symbol: coin,
        name: coin,
        current_price: Number(found.lastPrice) * USDT_INR,
        price_change_percentage_24h: Number(found.priceChangePercent),
        high_24h: Number(found.highPrice) * USDT_INR,
        low_24h: Number(found.lowPrice) * USDT_INR,
        volume: Number(found.volume) * USDT_INR,
        image: `https://cryptoicons.org/api/icon/${coin.toLowerCase()}/200`
      };
    }).filter(Boolean);

    const topGainers = coinsData.sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 10);
    const topLosers = coinsData.sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 10);

    res.json({ success: true, topGainers, topLosers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch top movers" });
  }
});

// 🔹 Route: /overview
router.get("/overview", async (req, res) => {
  try {
    const resData = await axios.get("https://api.coingecko.com/api/v3/global");
    const overview = {
      coin_market_cap: resData.data.data.active_cryptocurrencies,
      market_cap: resData.data.data.total_market_cap.inr,
      volume_24h: resData.data.data.total_volume.inr,
      btc_dominance: resData.data.data.market_cap_percentage.btc
    };

    console.log(overview.coin_market_cap);
    res.json({ success: true, overview });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch overview" });
  }
});

// 🔹 Route: /news
router.get("/news", async (req, res) => {
  try {
    // Example: Using CoinGecko news or MarketAux if API available
    const news = [
      { id: 1, title: "Bitcoin hits new ATH", url: "#", source: "CryptoDaily", published_at: new Date() },
      { id: 2, title: "Ethereum 2.0 staking starts", url: "#", source: "CoinDesk", published_at: new Date() },
      { id: 3, title: "BNB volume surges", url: "#", source: "CryptoNews", published_at: new Date() },
    ];
    res.json({ success: true, news });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch news" });
  }
});

// 🔹 WebSocket live prices
router.wsLivePrices = (wss) => {
  let liveData = [];

  function startWS() {
    const streams = majorCoins.map(c => `${c.toLowerCase()}usdt@ticker`).join("/");
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

    ws.on("open", () => console.log("Connected to Binance WS"));
    ws.on("message", (msg) => {
      try {
        const parsed = JSON.parse(msg.toString());
        const data = parsed.data;
        if (!data) return;

        const coin = data.s.replace("USDT", "");
        const updated = {
          id: data.s,
          symbol: coin,
          name: coin,
          current_price: Number(data.c) * USDT_INR,
          price_change_percentage_24h: Number(data.P),
          high_24h: Number(data.h) * USDT_INR,
          low_24h: Number(data.l) * USDT_INR,
          volume: Number(data.v) * USDT_INR,
          image: `https://cryptoicons.org/api/icon/${coin.toLowerCase()}/200`
        };

        const index = liveData.findIndex(c => c.symbol === coin);
        if (index > -1) liveData[index] = updated;
        else liveData.push(updated);

        const message = JSON.stringify(liveData);
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) client.send(message);
        });

      } catch (err) { console.error("WS parse error:", err); }
    });

    ws.on("close", () => { console.log("WS closed, reconnecting in 5s"); setTimeout(startWS, 5000); });
    ws.on("error", (err) => { console.error("WS error:", err); ws.close(); });
  }

  startWS();
};

module.exports = router;
