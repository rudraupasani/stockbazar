import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import axios from "axios";

const fallbackImage =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-yRzp5Y34fR97pNvBaJcIXCeLXMqOjGiUaF7ujovv3eFEvcKBC6jOSA-TYFSsZ0YeraQ&usqp=CAU";

const TickerItem = ({ coin }) => {
    const isUp = coin.price_change_percentage_24h > 0;
    return (
        <div className="flex items-center gap-2.5 px-5 py-2 rounded-full border shrink-0"
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}>
            <img src={coin.image || fallbackImage} alt={coin.name}
                className="w-5 h-5 rounded-full"
                onError={(e) => (e.target.src = fallbackImage)} />
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {coin.symbol?.toUpperCase()}
            </span>
            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                ₹{coin.current_price?.toLocaleString()}
            </span>
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${isUp ? "text-green-500" : "text-red-500"}`}>
                {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {coin.price_change_percentage_24h?.toFixed(2)}%
            </span>
        </div>
    );
};

const LivePriceTicker = () => {
    const [coins, setCoins] = useState([]);
    const [liveCoins, setLiveCoins] = useState([]);
    const trackRef = useRef(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await axios.get("http://localhost:5000/api/market/top-gainers");
                if (res.data.success) setCoins(res.data.gainers.slice(0, 15));
            } catch (err) {
                console.error("Ticker fetch error:", err);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:5000/ws/live-prices");
        ws.onmessage = (msg) => {
            try {
                const data = JSON.parse(msg.data);
                setCoins((prev) =>
                    prev.map((c) => {
                        const u = data.find((d) => d.symbol === c.symbol);
                        return u ? { ...c, ...u } : c;
                    })
                );
            } catch { }
        };
        return () => ws.close();
    }, []);

    const displayCoins = coins.length ? coins : [];

    return (
        <section className="py-4 border-y overflow-hidden"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3 px-4 mb-3">
                <Activity size={14} style={{ color: "var(--accent)" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Live Prices
                </span>
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--green, #22c55e)" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Live
                </span>
            </div>
            <div className="relative overflow-hidden">
                <motion.div
                    className="flex gap-3 w-max"
                    animate={{ x: [0, -(displayCoins.length * 220)] }}
                    transition={{ duration: displayCoins.length * 3, repeat: Infinity, ease: "linear" }}
                >
                    {[...displayCoins, ...displayCoins].map((coin, i) => (
                        <TickerItem key={`${coin.symbol}-${i}`} coin={coin} />
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default LivePriceTicker;
