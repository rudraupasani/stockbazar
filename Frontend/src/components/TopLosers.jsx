import React, { useEffect, useState } from "react";
import { ArrowDownRight, TrendingDown, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const fallbackImage =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-yRzp5Y34fR97pNvBaJcIXCeLXMqOjGiUaF7ujovv3eFEvcKBC6jOSA-TYFSsZ0YeraQ&usqp=CAU";

const TopLosers = () => {
    const [losers, setLosers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchLosers() {
            try {
                const res = await axios.get("http://localhost:5000/api/market/top-movers");
                if (res.data.success) setLosers(res.data.topLosers?.slice(0, 6) || []);
            } catch (err) {
                console.error("Losers fetch error:", err);
            }
        }
        fetchLosers();
    }, []);

    // websocket live updates
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:5000/ws/live-prices");
        ws.onmessage = (msg) => {
            try {
                const live = JSON.parse(msg.data);
                setLosers((prev) =>
                    prev.map((c) => {
                        const u = live.find((d) => d.symbol === c.symbol);
                        return u ? { ...c, ...u } : c;
                    })
                );
            } catch { }
        };
        return () => ws.close();
    }, []);

    if (!losers.length) return null;

    return (
        <section className="w-full px-4 py-12" style={{ backgroundColor: "var(--bg-base)" }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: "rgba(239,68,68,0.12)" }}>
                            <TrendingDown size={18} style={{ color: "#ef4444" }} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                                Today's Top Losers
                            </h2>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                Biggest 24h declines
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate("/market")}
                        className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                        style={{ color: "var(--accent)" }}
                    >
                        View All <ExternalLink size={14} />
                    </button>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {losers.map((coin, i) => (
                        <motion.div
                            key={coin.symbol || i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: i * 0.07 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -3 }}
                            className="sb-card p-5 flex items-center gap-4"
                            style={{ borderColor: "rgba(239,68,68,0.0)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                        >
                            <img
                                src={coin.image || fallbackImage}
                                alt={coin.name}
                                className="w-11 h-11 rounded-full"
                                onError={(e) => (e.target.src = fallbackImage)}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                                    {coin.name}
                                </p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    {coin.symbol?.toUpperCase()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-extrabold text-sm" style={{ color: "var(--text-primary)" }}>
                                    ₹{coin.current_price?.toLocaleString()}
                                </p>
                                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-red-500">
                                    <ArrowDownRight size={12} />
                                    {Math.abs(coin.price_change_percentage_24h || 0).toFixed(2)}%
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TopLosers;
