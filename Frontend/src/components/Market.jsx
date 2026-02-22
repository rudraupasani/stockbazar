import React, { useEffect, useState, useRef } from "react";
import {
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp,
    DollarSign,
    PieChart,
    Activity,
} from "lucide-react";
import axios from "axios";
import { useCrypto } from "../context/CryptoContext.jsx";

const fallbackImage =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-yRzp5Y34fR97pNvBaJcIXCeLXMqOjGiUaF7ujovv3eFEvcKBC6jOSA-TYFSsZ0YeraQ&usqp=CAU";

const MarketPage = () => {
    const [coins, setCoins] = useState([]);
    const wsRef = useRef(null);
    const { overviewData } = useCrypto();

    const MiniSparkline = ({ data, isPositive }) => {
        if (!data || data.length === 0) return null;
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        const points = data
            .map((val, i) => {
                const x = (i / (data.length - 1)) * 100;
                const y = 100 - ((val - min) / range) * 100;
                return `${x},${y}`;
            })
            .join(" ");

        return (
            <svg viewBox="0 0 100 100" className="w-full h-10" preserveAspectRatio="none">
                <polyline
                    points={points}
                    fill="none"
                    stroke={isPositive ? "var(--green)" : "var(--red)"}
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
        );
    };

    useEffect(() => {
        async function load() {
            try {
                const res = await axios.get("http://localhost:5000/api/market/top-gainers");
                if (res.data.success) {
                    const coinsWithChart = res.data.gainers.map((c) => ({
                        ...c,
                        market_cap: Number(c.quoteVolume || 0) * Number(c.current_price),
                        price_change_percentage_1h: Number(c.price_change_percentage_1h || 0),
                        price_change_percentage_7d: Number(c.price_change_percentage_7d || 0),
                        miniChart: Array.from({ length: 20 }, () =>
                            Number((c.low_24h + Math.random() * (c.high_24h - c.low_24h)).toFixed(2))
                        ),
                    }));
                    setCoins(coinsWithChart);
                }
            } catch (err) {
                console.error("Error loading data:", err);
            }
        }
        load();
    }, []);

    useEffect(() => {
        wsRef.current = new WebSocket("ws://localhost:5000/ws/live-prices");
        wsRef.current.onmessage = (msg) => {
            try {
                const live = JSON.parse(msg.data);
                setCoins((prev) =>
                    prev.map((coin) => {
                        const updated = live.find((c) => c.symbol === coin.symbol);
                        return updated ? { ...coin, ...updated } : coin;
                    })
                );
            } catch (err) {
                console.error("WS parse failed:", err);
            }
        };
        return () => wsRef.current?.close();
    }, []);

    const statsCards = [
        {
            label: "Market Cap",
            value: `₹${overviewData.market_cap?.toLocaleString()}`,
            icon: DollarSign,
            color: "#3b82f6",
            colorBg: "rgba(59,130,246,0.12)",
            sub: "Total",
        },
        {
            label: "24h Volume",
            value: `₹${overviewData.volume_24h?.toLocaleString()}`,
            icon: TrendingUp,
            color: "#22c55e",
            colorBg: "rgba(34,197,94,0.12)",
            sub: "24h",
        },
        {
            label: "BTC Dominance",
            value: `${overviewData.btc_dominance}%`,
            icon: PieChart,
            color: "#f97316",
            colorBg: "rgba(249,115,22,0.12)",
            sub: "BTC",
        },
    ];

    const ChangeCell = ({ value }) => {
        const v = Number(value) || 0;
        const isUp = v > 0;
        return (
            <span className={isUp ? "sb-badge-up" : "sb-badge-down"}>
                {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(v).toFixed(2)}%
            </span>
        );
    };

    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
        >
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

                {/* Page Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: "rgba(59,130,246,0.12)" }}
                    >
                        <Activity size={20} style={{ color: "#3b82f6" }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                            Market Overview
                        </h1>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                            Real-time cryptocurrency market data
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    {statsCards.map(({ label, value, icon: Icon, color, colorBg, sub }) => (
                        <div
                            key={label}
                            className="sb-card p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div
                                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: colorBg }}
                                >
                                    <Icon size={22} style={{ color }} />
                                </div>
                                <span
                                    className="text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded-lg"
                                    style={{ backgroundColor: colorBg, color }}
                                >
                                    {sub}
                                </span>
                            </div>
                            <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                                {label}
                            </p>
                            <p className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Desktop Table */}
                <div
                    className="hidden lg:block sb-card overflow-hidden"
                >
                    {/* Table Header */}
                    <div
                        className="grid grid-cols-8 gap-4 px-6 py-4 text-xs font-semibold uppercase tracking-wider border-b"
                        style={{
                            backgroundColor: "var(--card-bg-hover)",
                            borderBottomColor: "var(--border)",
                            color: "var(--text-muted)",
                        }}
                    >
                        <div className="col-span-2">Coin</div>
                        <div className="text-right">Price</div>
                        <div className="text-right">1h %</div>
                        <div className="text-right">24h %</div>
                        <div className="text-right">7d %</div>
                        <div className="text-right">24h Volume</div>
                        <div className="text-center">Chart</div>
                    </div>

                    {/* Rows */}
                    <div>
                        {coins.map((coin, i) => (
                            <div
                                key={`${coin.symbol}-${i}`}
                                className="grid grid-cols-8 gap-4 px-6 py-4 border-b transition-colors duration-150"
                                style={{ borderBottomColor: "var(--border)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--card-bg-hover)")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                                {/* Coin */}
                                <div className="col-span-2 flex items-center gap-3">
                                    <img
                                        src={coin.image || fallbackImage}
                                        alt={coin.name}
                                        className="w-9 h-9 rounded-full"
                                        onError={(e) => (e.target.src = fallbackImage)}
                                    />
                                    <div>
                                        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                                            {coin.name}
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                            {coin.symbol?.toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end items-center font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                                    ₹{coin.current_price?.toLocaleString()}
                                </div>
                                <div className="flex justify-end items-center">
                                    <ChangeCell value={coin.price_change_percentage_1h} />
                                </div>
                                <div className="flex justify-end items-center">
                                    <ChangeCell value={coin.price_change_percentage_24h} />
                                </div>
                                <div className="flex justify-end items-center">
                                    <ChangeCell value={coin.price_change_percentage_7d} />
                                </div>
                                <div className="flex justify-end items-center text-sm" style={{ color: "var(--text-secondary)" }}>
                                    ₹{coin.volume?.toLocaleString()}
                                </div>
                                <div className="flex items-center">
                                    <MiniSparkline
                                        data={coin.miniChart}
                                        isPositive={coin.price_change_percentage_24h > 0}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden grid gap-4">
                    {coins.map((coin, i) => (
                        <div key={`m-${coin.symbol}-${i}`} className="sb-card p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={coin.image || fallbackImage}
                                    alt={coin.name}
                                    className="w-10 h-10 rounded-full"
                                    onError={(e) => (e.target.src = fallbackImage)}
                                />
                                <div>
                                    <p className="font-bold" style={{ color: "var(--text-primary)" }}>
                                        {coin.name}
                                    </p>
                                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                        {coin.symbol?.toUpperCase()}
                                    </p>
                                </div>
                                <div className="ml-auto text-right">
                                    <p className="font-extrabold" style={{ color: "var(--text-primary)" }}>
                                        ₹{coin.current_price?.toLocaleString()}
                                    </p>
                                    <ChangeCell value={coin.price_change_percentage_24h} />
                                </div>
                            </div>
                            <div className="h-10">
                                <MiniSparkline
                                    data={coin.miniChart}
                                    isPositive={coin.price_change_percentage_24h > 0}
                                />
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default MarketPage;
