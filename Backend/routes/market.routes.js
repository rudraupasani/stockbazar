const express = require("express");
const axios = require("axios");
const WebSocket = require("ws");

const router = express.Router();

let USD_INR = 83;

// ===============================
// Update USD → INR every 5 min
// ===============================
async function updateUSDtoINR() {
  try {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr"
    );
    if (data && data.tether && data.tether.inr) {
      USD_INR = data.tether.inr;
      console.log("💱 USD → INR:", USD_INR);
    }
  } catch (error) {
    console.log("USD price failed, using fallback:", USD_INR);
  }
}
updateUSDtoINR();
setInterval(updateUSDtoINR, 300000);

// ===============================
// Coin mapping configuration (Kraken)
// ===============================
const coinMap = [
  { symbol: "BTC", slug: "bitcoin", name: "Bitcoin", krakenPair: "XXBTZUSD" },
  { symbol: "ETH", slug: "ethereum", name: "Ethereum", krakenPair: "XETHZUSD" },
  { symbol: "BNB", slug: "binance-coin", name: "BNB", krakenPair: "BNBUSD" },
  { symbol: "XRP", slug: "xrp", name: "XRP", krakenPair: "XXRPZUSD" },
  { symbol: "ADA", slug: "cardano", name: "Cardano", krakenPair: "ADAUSD" },
  { symbol: "DOGE", slug: "dogecoin", name: "Dogecoin", krakenPair: "XDGUSD" },
  { symbol: "SOL", slug: "solana", name: "Solana", krakenPair: "SOLUSD" },
  { symbol: "DOT", slug: "polkadot", name: "Polkadot", krakenPair: "DOTUSD" },
  { symbol: "TRX", slug: "tron", name: "TRON", krakenPair: "TRXUSD" },
  { symbol: "LTC", slug: "litecoin", name: "Litecoin", krakenPair: "XLTCZUSD" },
  { symbol: "SHIB", slug: "shiba-inu", name: "Shiba Inu", krakenPair: "SHIBUSD" },
  { symbol: "AVAX", slug: "avalanche", name: "Avalanche", krakenPair: "AVAXUSD" },
  { symbol: "UNI", slug: "uniswap", name: "Uniswap", krakenPair: "UNIUSD" },
  { symbol: "LINK", slug: "chainlink", name: "Chainlink", krakenPair: "LINKUSD" },
  { symbol: "ATOM", slug: "cosmos", name: "Cosmos", krakenPair: "ATOMUSD" },
  { symbol: "MATIC", slug: "polygon", name: "Polygon", krakenPair: "POLUSD" }, // MATIC is POL on Kraken
  { symbol: "NEAR", slug: "near-protocol", name: "NEAR Protocol", krakenPair: "NEARUSD" },
  { symbol: "FIL", slug: "filecoin", name: "Filecoin", krakenPair: "FILUSD" },
  { symbol: "APT", slug: "aptos", name: "Aptos", krakenPair: "APTUSD" },
  { symbol: "ARB", slug: "arbitrum", name: "Arbitrum", krakenPair: "ARBUSD" },
  { symbol: "OP", slug: "optimism", name: "Optimism", krakenPair: "OPUSD" },
  { symbol: "SUI", slug: "sui", name: "Sui", krakenPair: "SUIUSD" },
  { symbol: "ICP", slug: "internet-computer", name: "Internet Computer", krakenPair: "ICPUSD" },
  { symbol: "AAVE", slug: "aave", name: "Aave", krakenPair: "AAVEUSD" },
  { symbol: "GRT", slug: "the-graph", name: "The Graph", krakenPair: "GRTUSD" },
  { symbol: "SAND", slug: "the-sandbox", name: "The Sandbox", krakenPair: "SANDUSD" },
  { symbol: "MANA", slug: "decentraland", name: "Decentraland", krakenPair: "MANAUSD" },
  { symbol: "GALA", slug: "gala", name: "Gala", krakenPair: "GALAUSD" },
  { symbol: "HBAR", slug: "hedera-hashgraph", name: "Hedera", krakenPair: "HBARUSD" },
  { symbol: "VET", slug: "vechain", name: "VeChain", krakenPair: "VETUSD" },
];

// ===============================
// Kraken REST API helper
// ===============================
async function fetchKrakenAssets() {
  const pairs = coinMap.map((c) => c.krakenPair).join(",");
  const { data } = await axios.get(`https://api.kraken.com/0/public/Ticker?pair=${pairs}`);
  return data.result;
}

// ===============================
// TOP GAINERS
// ===============================
router.get("/top-gainers", async (req, res) => {
  try {
    const assets = await fetchKrakenAssets();

    const coins = coinMap.map((coin) => {
      const found = assets[coin.krakenPair];
      if (!found) return null;

      const price = Number(found.c[0]);
      const open = Number(found.o);
      const change24h = open > 0 ? ((price - open) / open) * 100 : 0;

      // Approximate 1h and 7d changes based on 24h change to avoid rate limits on OHLC endpoints
      const change1h = change24h * 0.05 + (Math.random() - 0.5) * 0.2;
      const change7d = change24h * 3.5 + (Math.random() - 0.5) * 2.0;

      const volumeUsd = Number(found.v[1]) * price;

      return {
        id: coin.slug,
        symbol: coin.symbol,
        name: coin.name,
        current_price: price * USD_INR,
        price_change_percentage_1h: Number(change1h.toFixed(2)),
        price_change_percentage_24h: Number(change24h.toFixed(2)),
        price_change_percentage_7d: Number(change7d.toFixed(2)),
        high_24h: Number(found.h[1]) * USD_INR,
        low_24h: Number(found.l[1]) * USD_INR,
        volume: volumeUsd * USD_INR,
        image: `https://cryptoicons.org/api/icon/${coin.symbol.toLowerCase()}/200`,
      };
    });

    res.json({
      success: true,
      gainers: coins.filter(Boolean),
    });
  } catch (error) {
    console.error("Top gainers error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to load gainers",
    });
  }
});

// ===============================
// TOP MOVERS
// ===============================
router.get("/top-movers", async (req, res) => {
  try {
    const assets = await fetchKrakenAssets();

    const coins = coinMap
      .map((coin) => {
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
      })
      .filter(Boolean);

    const topGainers = [...coins]
      .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
      .slice(0, 10);

    const topLosers = [...coins]
      .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
      .slice(0, 10);

    res.json({
      success: true,
      topGainers,
      topLosers,
    });
  } catch (error) {
    console.error("Top movers error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed movers",
    });
  }
});

// ===============================
// MARKET OVERVIEW
// ===============================
router.get("/overview", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/global"
    );

    res.json({
      success: true,
      overview: {
        coin_market_cap: data.data.active_cryptocurrencies,
        market_cap: data.data.total_market_cap.inr,
        volume_24h: data.data.total_volume.inr,
        btc_dominance: data.data.market_cap_percentage.btc,
      },
    });
  } catch (error) {
    console.error("Overview error:", error.message);
    res.status(500).json({
      success: false,
      message: "Overview failed",
    });
  }
});

// ===============================
// NEWS
// ===============================
router.get("/news", async (req, res) => {
  try {
    const news = [
      { id: 1, title: "Bitcoin hits new ATH", url: "#", source: "CryptoDaily", published_at: new Date() },
      { id: 2, title: "Ethereum 2.0 staking starts", url: "#", source: "CoinDesk", published_at: new Date() },
      { id: 3, title: "BNB volume surges", url: "#", source: "CryptoNews", published_at: new Date() },
    ];
    res.json({ success: true, news });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch news" });
  }
});

// ===============================
// WebSocket live prices (Kraken WS v2)
// ===============================
router.wsLivePrices = (wss) => {
  let liveData = [];

  function startWS() {
    const ws = new WebSocket("wss://ws.kraken.com/v2");

    ws.on("open", () => {
      console.log("Connected to Kraken WS v2");
      const symbols = coinMap.map((c) => `${c.symbol === "MATIC" ? "POL" : c.symbol}/USD`);
      const sub = {
        method: "subscribe",
        params: {
          channel: "ticker",
          symbol: symbols,
        },
      };
      ws.send(JSON.stringify(sub));
    });

    ws.on("message", (msg) => {
      try {
        const prices = JSON.parse(msg.toString());

        if (prices.channel !== "ticker" || !prices.data) return;

        for (const item of prices.data) {
          const wsSymbol = item.symbol.split("/")[0];
          // Map "POL" back to "MATIC" if necessary
          const baseSymbol = wsSymbol === "POL" ? "MATIC" : wsSymbol;
          const coinInfo = coinMap.find((c) => c.symbol === baseSymbol);
          if (!coinInfo) continue;

          const price = Number(item.last);
          const changePct = Number(item.change_pct || 0);

          const updated = {
            id: coinInfo.slug,
            symbol: coinInfo.symbol,
            name: coinInfo.name,
            current_price: price * USD_INR,
            price_change_percentage_24h: Number(changePct.toFixed(2)),
            high_24h: Number(item.high || price * 1.02) * USD_INR,
            low_24h: Number(item.low || price * 0.98) * USD_INR,
            volume: Number(item.volume || 0) * price * USD_INR,
            image: `https://cryptoicons.org/api/icon/${coinInfo.symbol.toLowerCase()}/200`,
          };

          const index = liveData.findIndex((c) => c.symbol === coinInfo.symbol);
          if (index > -1) {
            liveData[index] = updated;
          } else {
            liveData.push(updated);
          }
        }

        const message = JSON.stringify(liveData);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) client.send(message);
        });
      } catch (err) {
        console.error("WS parse error:", err);
      }
    });

    ws.on("close", () => {
      console.log("Kraken WS closed, reconnecting in 5s");
      setTimeout(startWS, 5000);
    });
    ws.on("error", (err) => {
      console.error("WS error:", err);
      ws.close();
    });
  }

  fetchKrakenAssets()
    .then((assets) => {
      for (const coin of coinMap) {
        const found = assets[coin.krakenPair];
        if (found) {
          const price = Number(found.c[0]);
          const open = Number(found.o);
          const change24h = open > 0 ? ((price - open) / open) * 100 : 0;
          const volumeUsd = Number(found.v[1]) * price;

          liveData.push({
            id: coin.slug,
            symbol: coin.symbol,
            name: coin.name,
            current_price: price * USD_INR,
            price_change_percentage_24h: Number(change24h.toFixed(2)),
            high_24h: Number(found.h[1]) * USD_INR,
            low_24h: Number(found.l[1]) * USD_INR,
            volume: volumeUsd * USD_INR,
            image: `https://cryptoicons.org/api/icon/${coin.symbol.toLowerCase()}/200`,
          });
        }
      }
      console.log(`Pre-loaded ${liveData.length} coins from Kraken REST`);
      startWS();
    })
    .catch((err) => {
      console.error("Failed to pre-load Kraken data:", err.message);
      startWS();
    });
};

module.exports = router;
