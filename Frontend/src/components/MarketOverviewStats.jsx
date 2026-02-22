import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Volume2, Bitcoin, Globe } from "lucide-react";
import { useCrypto } from "../context/CryptoContext";

const fmt = (num) => {
    if (!num || num === 0) return "—";
    if (num >= 1e12) return `₹${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `₹${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `₹${(num / 1e6).toFixed(2)}M`;
    return `₹${num.toLocaleString()}`;
};

const MarketOverviewStats = () => {
    const { overviewData } = useCrypto();

    const stats = [
        {
            label: "Total Market Cap",
            value: fmt(overviewData?.market_cap),
            icon: Globe,
            color: "#3b82f6",
            colorBg: "rgba(59,130,246,0.12)",
            desc: "Global crypto market",
        },
        {
            label: "24h Volume",
            value: fmt(overviewData?.volume_24h),
            icon: Volume2,
            color: "#22c55e",
            colorBg: "rgba(34,197,94,0.12)",
            desc: "Total trading volume",
        },
        {
            label: "BTC Dominance",
            value: overviewData?.btc_dominance ? `${Number(overviewData.btc_dominance).toFixed(1)}%` : "—",
            icon: Bitcoin,
            color: "#f59e0b",
            colorBg: "rgba(245,158,11,0.12)",
            desc: "Bitcoin market share",
        },
        {
            label: "Active Coins",
            value: overviewData?.coin_market_cap ? overviewData.coin_market_cap.toLocaleString() : "200+",
            icon: TrendingUp,
            color: "#a855f7",
            colorBg: "rgba(168,85,247,0.12)",
            desc: "Tracked cryptocurrencies",
        },
    ];

    return (
        <section
            className="w-full px-4 py-12 border-y"
            style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-2 mb-8">
                    <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                        Market Overview
                    </h2>
                    <span
                        className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "#22c55e" }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Live
                    </span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map(({ label, value, icon: Icon, color, colorBg, desc }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: i * 0.08 }}
                            viewport={{ once: true }}
                            className="sb-card p-5"
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                                style={{ backgroundColor: colorBg }}
                            >
                                <Icon size={20} style={{ color }} />
                            </div>
                            <p className="text-2xl font-extrabold leading-none mb-1" style={{ color: "var(--text-primary)" }}>
                                {value}
                            </p>
                            <p className="text-sm font-medium mb-0.5" style={{ color: "var(--text-secondary)" }}>
                                {label}
                            </p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                {desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MarketOverviewStats;
