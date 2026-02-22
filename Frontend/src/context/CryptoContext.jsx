import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const CryptoContext = createContext();

export const CryptoProvider = ({ children }) => {
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [overviewData, setOverviewData] = useState({
    market_cap: 0,
    volume_24h: 0,
    btc_dominance: 0,
  });
  const [news, setNews] = useState([]);
  const [livePrices, setLivePrices] = useState([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Top movers
        const moversRes = await axios.get("http://localhost:5000/api/market/top-movers");
        if (moversRes.data.success) {
          setTopGainers(moversRes.data.topGainers || []);
          setTopLosers(moversRes.data.topLosers || []);
        }

        // Overview
        const overviewRes = await axios.get("http://localhost:5000/api/market/overview");

        if (overviewRes.data.success) {
          const o = overviewRes.data.overview;

          setOverviewData({
            market_cap: Number(o.market_cap) || 0,
            volume_24h: Number(o.volume_24h) || 0,
            btc_dominance: Number(o.btc_dominance) || 0,
            coin_market_cap: Number(o.coin_market_cap) || 0,
          });
        }

        // News
     const newsRes = await axios.get("http://localhost:5000/api/market/news");
      if (newsRes.data.success) setNews(newsRes.data.news || []);
    } catch (err) {
      console.error("Failed to fetch market data:", err);
    }
  };

  fetchData();
}, []);

// WebSocket for live prices
useEffect(() => {
  const ws = new WebSocket("ws://localhost:5000/ws/live-prices");

  ws.onopen = () => console.log("Connected to live prices WebSocket");

  ws.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data);
      setLivePrices(data || []);
    } catch (err) {
      console.error("Failed to parse live prices WS data:", err);
    }
  };

  ws.onclose = () => console.log("WebSocket closed");
  ws.onerror = (err) => console.error("WebSocket error:", err);

  return () => ws.close();
}, []);

return (
  <CryptoContext.Provider
    value={{ topGainers, topLosers, overviewData, news, livePrices }}
  >
    {children}
  </CryptoContext.Provider>
);
};

export const useCrypto = () => useContext(CryptoContext);
