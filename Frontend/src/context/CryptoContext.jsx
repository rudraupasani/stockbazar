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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const moversRes = await axios.get("import.meta.env.VITE_API_BASE_URL/api/market/top-movers");
        if (moversRes.data.success) {
          setTopGainers(moversRes.data.topGainers || []);
          setTopLosers(moversRes.data.topLosers || []);
        }

        const overviewRes = await axios.get("import.meta.env.VITE_API_BASE_URL/api/market/overview");
        if (overviewRes.data.success) {
          const o = overviewRes.data.overview;
          setOverviewData({
            market_cap: Number(o.market_cap) || 0,
            volume_24h: Number(o.volume_24h) || 0,
            btc_dominance: Number(o.btc_dominance) || 0,
            coin_market_cap: Number(o.coin_market_cap) || 0,
          });
        }

        const newsRes = await axios.get("import.meta.env.VITE_API_BASE_URL/api/market/news");
        if (newsRes.data.success) setNews(newsRes.data.news || []);
      } catch (err) {
        console.error("Failed to fetch market data:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const ws = new WebSocket("import.meta.env.VITE_WS_BASE_URL/ws/live-prices");

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
    <CryptoContext.Provider value={{ topGainers, topLosers, overviewData, news, livePrices }}>
      {children}
    </CryptoContext.Provider>
  );
};

export const useCrypto = () => useContext(CryptoContext);



