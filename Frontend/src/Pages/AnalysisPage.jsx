import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bot, Search, TrendingUp, TrendingDown, Minus,
    Target, BarChart3, Sparkles, Brain, AlertTriangle,
    RefreshCw, Info, ShieldCheck, Clock3, CircleDollarSign,
} from "lucide-react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const fallbackImage =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-yRzp5Y34fR97pNvBaJcIXCeLXMqOjGiUaF7ujovv3eFEvcKBC6jOSA-TYFSsZ0YeraQ&usqp=CAU";

/* ─── colour helpers ─────────────────────────────────────────── */
const gradeColor = (g) => {
    if (!g) return "#94a3b8"; // Fallback to hex for opacity logic
    if (g === "A+") return "#22c55e";
    if (g === "A") return "#4ade80";
    if (g === "B") return "#86efac";
    if (g === "C") return "#f59e0b";
    if (g === "D") return "#fb923c";
    return "#ef4444";
};

const signalColor = (s = "") => {
    const up = ["strong buy", "buy"];
    const dn = ["strong sell", "sell"];
    const l = s.toLowerCase();
    if (up.some(v => l.includes(v))) return { color: "var(--green)", bg: "var(--green-bg)" };
    if (dn.some(v => l.includes(v))) return { color: "var(--red)", bg: "var(--red-bg)" };
    return { color: "var(--accent)", bg: "var(--accent-bg)" };
};

const riskColor = (r = "") => {
    if (r === "Low") return "var(--green)";
    if (r === "Medium") return "var(--accent)";
    return "var(--red)";
};

const normalizeAnalysis = (analysis) => {
    if (!analysis || typeof analysis !== "object" || Array.isArray(analysis)) {
        return {
            summary_beginner: "No summary available.",
            summary_advanced: "No technical summary available.",
            trend: "Neutral",
            trend_score: 0,
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
            confidence: 0,
            grade: "C",
            buy_signal: "Hold",
            key_levels: [],
        };
    }

    return {
        summary_beginner: analysis.summary_beginner || "No summary available.",
        summary_advanced: analysis.summary_advanced || "No technical summary available.",
        trend: analysis.trend || "Neutral",
        trend_score: Number(analysis.trend_score) || 0,
        momentum: analysis.momentum || "Neutral",
        volatility: analysis.volatility || "Low",
        support: analysis.support || "N/A",
        resistance: analysis.resistance || "N/A",
        stop_loss: analysis.stop_loss || "N/A",
        take_profit: analysis.take_profit || "N/A",
        sentiment: analysis.sentiment || "Neutral",
        whale_activity: analysis.whale_activity || "Neutral",
        pattern: analysis.pattern || "None",
        prediction_24h: analysis.prediction_24h || "N/A",
        prediction_7d: analysis.prediction_7d || "N/A",
        risk: analysis.risk || "Medium",
        confidence: Number(analysis.confidence) || 0,
        grade: analysis.grade || "C",
        buy_signal: analysis.buy_signal || "Hold",
        key_levels: Array.isArray(analysis.key_levels) ? analysis.key_levels : [],
    };
};

/* ─── Sub-components ─────────────────────────────────────────── */
const Metric = ({ label, value, sub, color }) => (
    <div className="flex flex-col gap-1 p-4 rounded-xl"
        style={{ backgroundColor: "var(--card-bg-hover)", border: "1px solid var(--border)" }}>
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p className="text-lg font-extrabold" style={{ color: color || "var(--text-primary)" }}>{value || "—"}</p>
        {sub && <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{sub}</p>}
    </div>
);

const ScoreBar = ({ label, value, color }) => (
    <div>
        <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>{label}</span>
            <span className="text-xs font-bold" style={{ color }}>{value}%</span>
        </div>
        <div className="h-2 rounded-full w-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
            />
        </div>
    </div>
);

const InsightTile = ({ icon: Icon, title, value, tone = "default" }) => {
    const tones = {
        default: { bg: "var(--card-bg-hover)", border: "var(--border)", text: "var(--text-primary)" },
        green: { bg: "var(--green-bg)", border: "var(--green)", text: "var(--green)" },
        red: { bg: "var(--red-bg)", border: "var(--red)", text: "var(--red)" },
        accent: { bg: "var(--accent-bg)", border: "var(--accent-border)", text: "var(--accent)" },
    };
    const style = tones[tone] || tones.default;

    return (
        <div className="rounded-2xl p-4" style={{ backgroundColor: style.bg, border: `1px solid ${style.border}` }}>
            <div className="flex items-center gap-2 mb-2">
                <Icon size={15} style={{ color: style.text }} />
                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: style.text }}>{title}</p>
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{value || "—"}</p>
        </div>
    );
};

const PriceLevelChart = ({ levels, currentPrice }) => {
    const parsedLevels = levels
        .map((level) => {
            const num = Number(String(level.value).replace(/[^0-9.]/g, ""));
            return Number.isFinite(num) ? { ...level, numeric: num } : null;
        })
        .filter(Boolean);

    if (!parsedLevels.length) return null;

    const min = Math.min(...parsedLevels.map((item) => item.numeric));
    const max = Math.max(...parsedLevels.map((item) => item.numeric));
    const span = max - min || 1;
    const current = Number(currentPrice);

    return (
        <div className="rounded-2xl p-4" style={{ backgroundColor: "var(--card-bg-hover)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Price Level View</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Relative to current price</p>
            </div>
            <div className="space-y-2">
                {parsedLevels.map((item) => {
                    const pct = ((item.numeric - min) / span) * 100;
                    const isCurrent = current && Math.abs(item.numeric - current) < span * 0.02;
                    return (
                        <div key={item.label}>
                            <div className="flex justify-between text-xs mb-1" style={{ color: "var(--text-secondary)" }}>
                                <span>{item.label}</span>
                                <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
                            </div>
                            <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--border)" }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.max(10, pct)}%` }}
                                    transition={{ duration: 0.6 }}
                                    className="h-full rounded-full"
                                    style={{
                                        background: isCurrent ? "var(--accent)" : item.color,
                                        opacity: isCurrent ? 1 : 0.85,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* ─── Main Page ──────────────────────────────────────────────── */
const AnalysisPage = () => {
    const [coins, setCoins] = useState([]);
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState(null);
    const [showDrop, setShowDrop] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [coinsLoading, setCoinsLoading] = useState(true);

    const safeCoins = Array.isArray(coins) ? coins : [];

    /* Fetch coin list */
    useEffect(() => {
        axios.get("http://localhost:5000/api/market/top-gainers")
            .then((r) => {
                if (r.data.success) setCoins(r.data.gainers || []);
                else setCoins([]);
            })
            .catch(() => {
                setCoins([]);
            })
            .finally(() => setCoinsLoading(false));
    }, []);

    const filtered = query.length >= 1
        ? safeCoins.filter(c =>
            (c?.symbol && c.symbol.toLowerCase().includes(query.toLowerCase())) ||
            (c?.name && c.name.toLowerCase().includes(query.toLowerCase()))
        ).slice(0, 10)
        : safeCoins.slice(0, 10);

    const selectCoin = (coin) => {
        if (!coin) return;
        setSelected(coin);
        setQuery(coin.symbol || coin.name || "");
        setShowDrop(false);
        setResult(null);
        setError("");
    };

    const runAnalysis = async () => {
        if (!selected) return;
        setLoading(true);
        setResult(null);
        setError("");
        try {
            const r = await axios.post("http://localhost:5000/api/ai/analysis", {
                coinData: {
                    symbol: selected.symbol,
                    name: selected.name,
                    current_price: selected.current_price,
                    price_change_percentage_24h: selected.price_change_percentage_24h,
                    high_24h: selected.high_24h,
                    low_24h: selected.low_24h,
                    volume: selected.volume,
                },
            });
            if (r.data.success) {
                // Ensure we have a valid object
                const analysisData = r.data?.analysis;
                setResult(normalizeAnalysis(analysisData));
            } else {
                setError(r.data.message || "Analysis failed.");
            }
        } catch (e) {
            console.error("Analysis error:", e);
            setError(e.response?.data?.message || e.message || "Failed to connect to AI server.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (selected) {
                runAnalysis();
            } else if (filtered.length > 0) {
                const head = filtered[0];
                selectCoin(head);
                // After selecting, trigger analysis on next tick or just let user click
                // Better: auto-run if it was an exact match
                if (query.toLowerCase() === head.symbol.toLowerCase() || query.toLowerCase() === head.name.toLowerCase()) {
                    runAnalysis();
                }
            }
        }
    };

    /* ─── Render ─────────────────────────────────────────────── */
    return (
        <>
            <Navbar />
            <div className="min-h-screen pt-20 pb-16 px-4" style={{ backgroundColor: "var(--bg-base)" }}>
                <div className="max-w-5xl mx-auto">

                    {/* Page Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="sb-card overflow-hidden p-6 md:p-8">
                            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                                <div className="max-w-2xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-4"
                                        style={{ backgroundColor: "var(--accent-bg)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}>
                                        <Bot size={14} /> Powered by Cerebras AI
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold mb-3" style={{ color: "var(--text-primary)" }}>
                                        AI Market Analysis, Reimagined
                                    </h1>
                                    <p className="text-base leading-7" style={{ color: "var(--text-secondary)" }}>
                                        Choose a coin, review an instant sentiment snapshot, and get a sharper view of trend, momentum, risk, and key price levels in seconds.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-[280px]">
                                    <InsightTile icon={ShieldCheck} title="Risk-aware" value="Balanced outlook" tone="accent" />
                                    <InsightTile icon={Clock3} title="Speed" value="Fast analysis" tone="default" />
                                    <InsightTile icon={CircleDollarSign} title="Focus" value="Actionable levels" tone="green" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Coin Selector + Analyse Button */}
                    <div className="sb-card p-6 mb-8">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search Dropdown */}
                            <div className="relative flex-1">
                                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                    style={{ color: "var(--text-muted)" }} />
                                <input
                                    type="text"
                                    placeholder={coinsLoading ? "Loading coins…" : "Search coin (e.g. BTC, ETH, SOL)…"}
                                    value={query}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setQuery(val);
                                        setShowDrop(true);
                                        // Auto-select if exact match symbol
                                        const exact = safeCoins.find(c => typeof c?.symbol === "string" && c.symbol.toLowerCase() === val.toLowerCase());
                                        if (exact) setSelected(exact);
                                        else if (selected) setSelected(null);
                                    }}
                                    onFocus={() => setShowDrop(true)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                                    style={{
                                        backgroundColor: "var(--card-bg-hover)",
                                        border: "1px solid var(--border)",
                                        color: "var(--text-primary)",
                                    }}
                                    onMouseEnter={(e) => (e.target.style.borderColor = "var(--accent)")}
                                    onMouseLeave={(e) => { if (document.activeElement !== e.target) e.target.style.borderColor = "var(--border)"; }}
                                />

                                {/* Dropdown */}
                                <AnimatePresence>
                                    {showDrop && query.length > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -6 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute z-30 top-full left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-xl"
                                            style={{ backgroundColor: "var(--bg-surface)", border: "1px solid var(--border)" }}
                                        >
                                            {filtered.length > 0 ? (
                                                filtered.map((coin) => (
                                                    <button
                                                        key={coin.symbol}
                                                        onClick={() => selectCoin(coin)}
                                                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:bg-(--card-bg-hover)"
                                                    >
                                                        <img src={coin.image || fallbackImage} alt={coin.symbol}
                                                            className="w-7 h-7 rounded-full"
                                                            onError={(e) => (e.target.src = fallbackImage)} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                                                {coin.symbol}
                                                            </p>
                                                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                                ₹{coin.current_price?.toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`text-xs font-semibold ${coin.price_change_percentage_24h >= 0 ? "text-(--green)" : "text-(--red)"}`}
                                                        >
                                                            {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                                                            {coin.price_change_percentage_24h?.toFixed(2)}%
                                                        </span>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-sm" style={{ color: "var(--text-muted)" }}>
                                                    No coins found for "{query}"
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Analyse Button */}
                            <button
                                onClick={runAnalysis}
                                disabled={!selected || loading}
                                className={`flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${selected && !loading
                                    ? "bg-(--accent) text-black hover:bg-(--accent-hover)"
                                    : "bg-(--card-bg-hover) text-(--text-muted) opacity-60 cursor-not-allowed"
                                    }`}
                                style={{
                                    border: "1px solid var(--border)",
                                }}
                            >
                                {loading
                                    ? <><RefreshCw size={16} className="animate-spin" /> Analysing…</>
                                    : <><Brain size={16} /> Analyse Now</>}
                            </button>
                        </div>

                        {/* Selected coin chip */}
                        {selected && (
                            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t" style={{ borderTopColor: "var(--border)" }}>
                                <img src={selected.image || fallbackImage} alt={selected.symbol}
                                    className="w-7 h-7 rounded-full"
                                    onError={(e) => (e.target.src = fallbackImage)} />
                                <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                                    {selected.symbol}
                                </span>
                                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                    ₹{selected.current_price?.toLocaleString()}
                                </span>
                                <span className={`text-xs font-semibold ${selected.price_change_percentage_24h >= 0 ? "text-(--green)" : "text-(--red)"}`}>
                                    {selected.price_change_percentage_24h >= 0 ? "+" : ""}{selected.price_change_percentage_24h?.toFixed(2)}%
                                </span>
                            </div>
                        )}

                        {!selected && !coinsLoading && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {safeCoins.slice(0, 6).map((coin) => (
                                    <button
                                        key={coin.symbol}
                                        onClick={() => selectCoin(coin)}
                                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                                        style={{ backgroundColor: "var(--card-bg-hover)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                                    >
                                        {coin.symbol}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Loading skeleton */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="sb-card p-10 text-center"
                        >
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: "var(--accent-bg)", border: "2px solid var(--accent-border)" }}>
                                    <Bot size={28} style={{ color: "var(--accent)" }} className="animate-pulse" />
                                </div>
                                <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                                    AI is analysing {selected?.symbol}…
                                </h3>
                                <p className="text-sm max-w-md" style={{ color: "var(--text-secondary)" }}>
                                    Reviewing momentum, volatility, support and resistance, plus a concise action plan for the next move.
                                </p>
                                <div className="flex gap-2 mt-2">
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} className="w-2.5 h-2.5 rounded-full animate-bounce"
                                            style={{ backgroundColor: "var(--accent)", animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="sb-card p-6 flex items-center gap-3 border-red-500/30"
                        >
                            <AlertTriangle size={20} className="text-red-500 shrink-0" />
                            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{error}</p>
                        </motion.div>
                    )}

                    {/* Result */}
                    <AnimatePresence>
                        {result && !loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-5"
                            >
                                {/* Top Bar */}
                                <div className="sb-card p-6">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <img src={selected?.image || fallbackImage} alt={selected?.symbol}
                                                className="w-14 h-14 rounded-full"
                                                onError={(e) => (e.target.src = fallbackImage)} />
                                            <div>
                                                <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                                                    {selected?.symbol}
                                                </h2>
                                                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                                    ₹{selected?.current_price?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-xs text-center mb-1" style={{ color: "var(--text-muted)" }}>AI Grade</p>
                                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg"
                                                    style={{
                                                        backgroundColor: gradeColor(result.grade) + "20",
                                                        border: `2px solid ${gradeColor(result.grade)}40`,
                                                        color: gradeColor(result.grade),
                                                    }}>
                                                    {result.grade || "—"}
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xs text-center mb-1" style={{ color: "var(--text-muted)" }}>Signal</p>
                                                <div className="px-5 py-2 rounded-xl font-bold text-sm text-center"
                                                    style={{
                                                        backgroundColor: signalColor(result.buy_signal).bg,
                                                        color: signalColor(result.buy_signal).color,
                                                        border: `1px solid var(--border)`,
                                                    }}>
                                                    {result.buy_signal || "—"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <InsightTile icon={TrendingUp} title="Trend" value={result.trend || "Neutral"} tone={result.trend === "Bullish" ? "green" : result.trend === "Bearish" ? "red" : "accent"} />
                                        <InsightTile icon={Sparkles} title="Momentum" value={result.momentum || "Neutral"} tone="accent" />
                                        <InsightTile icon={BarChart3} title="Risk" value={result.risk || "Medium"} tone={result.risk === "Low" ? "green" : result.risk === "High" ? "red" : "accent"} />
                                    </div>
                                </div>

                                {/* Scores */}
                                <div className="sb-card p-6">
                                    <h3 className="text-base font-bold mb-5" style={{ color: "var(--text-primary)" }}>
                                        Analysis Scores
                                    </h3>
                                    <div className="space-y-4">
                                        <ScoreBar label="Trend Score" value={result.trend_score || 0}
                                            color={result.trend_score >= 60 ? "var(--green)" : result.trend_score >= 40 ? "var(--accent)" : "var(--red)"} />
                                        <ScoreBar label="AI Confidence" value={result.confidence || 0}
                                            color="#3b82f6" />
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <Metric label="Trend" value={result.trend}
                                        color={result.trend === "Bullish" ? "var(--green)" : result.trend === "Bearish" ? "var(--red)" : "var(--accent)"} />
                                    <Metric label="Momentum" value={result.momentum} />
                                    <Metric label="Volatility" value={result.volatility} />
                                    <Metric label="Sentiment" value={result.sentiment}
                                        color={result.sentiment === "Bullish" ? "var(--green)" : result.sentiment === "Bearish" ? "var(--red)" : "var(--accent)"} />
                                    <Metric label="Pattern" value={result.pattern} />
                                    <Metric label="Whale Activity" value={result.whale_activity} />
                                    <Metric label="Risk" value={result.risk} color={riskColor(result.risk)} />
                                    <Metric label="24h Prediction" value={result.prediction_24h} />
                                </div>

                                {/* Price Levels */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Support / Resistance */}
                                    <div className="sb-card p-6">
                                        <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                                            <BarChart3 size={16} style={{ color: "var(--accent)" }} /> Price Levels
                                        </h3>
                                        <div className="space-y-3">
                                            {[
                                                { label: "Support", value: result.support, color: "var(--green)", icon: "🟢" },
                                                { label: "Resistance", value: result.resistance, color: "var(--red)", icon: "🔴" },
                                                { label: "Stop Loss", value: result.stop_loss, color: "#f97316", icon: "🛑" },
                                                { label: "Take Profit", value: result.take_profit, color: "var(--green)", icon: "🎯" },
                                            ].map(({ label, value, color, icon }) => (
                                                <div key={label} className="flex items-center justify-between p-3 rounded-xl"
                                                    style={{ backgroundColor: "var(--card-bg-hover)", border: "1px solid var(--border)" }}>
                                                    <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                                        {icon} {label}
                                                    </span>
                                                    <span className="text-sm font-bold" style={{ color }}>{value || "—"}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4">
                                            <PriceLevelChart
                                                levels={[
                                                    { label: "Support", value: result.support, color: "var(--green)" },
                                                    { label: "Current", value: selected?.current_price ? `₹${selected.current_price.toLocaleString()}` : "—", color: "var(--accent)" },
                                                    { label: "Resistance", value: result.resistance, color: "var(--red)" },
                                                    { label: "Stop Loss", value: result.stop_loss, color: "#f97316" },
                                                    { label: "Take Profit", value: result.take_profit, color: "var(--green)" },
                                                ]}
                                                currentPrice={selected?.current_price}
                                            />
                                        </div>
                                    </div>

                                    {/* Prediction */}
                                    <div className="sb-card p-6">
                                        <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                                            <Target size={16} style={{ color: "#a855f7" }} /> Predictions
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="p-4 rounded-xl"
                                                style={{ backgroundColor: "var(--green-bg)", border: "1px solid var(--green)" }}>
                                                <p className="text-xs font-semibold mb-1" style={{ color: "var(--green)" }}>24H OUTLOOK</p>
                                                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                                    {result.prediction_24h || "—"}
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-xl"
                                                style={{ backgroundColor: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
                                                <p className="text-xs font-semibold mb-1 text-blue-400">7-DAY FORECAST</p>
                                                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                                    {result.prediction_7d || "—"}
                                                </p>
                                            </div>

                                            {result.key_levels?.length > 0 && (
                                                <div className="p-4 rounded-xl"
                                                    style={{ backgroundColor: "var(--card-bg-hover)", border: "1px solid var(--border)" }}>
                                                    <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                                                        KEY LEVELS
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {result.key_levels.map((lvl, i) => (
                                                            <span key={i} className="text-xs font-bold px-2.5 py-1 rounded-lg"
                                                                style={{ backgroundColor: "var(--accent-bg)", color: "var(--accent)", border: "1px solid var(--accent-border)" }}>
                                                                {lvl}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Summaries */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Beginner */}
                                    <div className="sb-card p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Sparkles size={16} style={{ color: "#f59e0b" }} />
                                            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                                Beginner Summary
                                            </h3>
                                        </div>
                                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                            {result.summary_beginner || "—"}
                                        </p>
                                    </div>

                                    {/* Advanced */}
                                    <div className="sb-card p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Brain size={16} style={{ color: "#3b82f6" }} />
                                            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                                                Technical Summary
                                            </h3>
                                        </div>
                                        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                            {result.summary_advanced || "—"}
                                        </p>
                                    </div>
                                </div>

                                {/* Disclaimer */}
                                <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-(--card-bg) border border-(--border)">
                                    <Info size={14} className="shrink-0 mt-0.5 text-(--text-muted)" />
                                    <p className="text-xs text-(--text-muted)">
                                        This AI analysis is for educational purposes only and does not constitute financial advice. Always do your own research before trading.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Empty state (no analysis run yet) */}
                    {!result && !loading && !error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="sb-card p-14 text-center"
                        >
                            <Brain size={48} className="mx-auto mb-4 opacity-20" style={{ color: "var(--text-muted)" }} />
                            <p className="text-base font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                                Pick a coin and get an instant AI readout
                            </p>
                            <p className="text-sm max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
                                The analysis blends trend, momentum, volatility, support and resistance, and a practical trading signal into one clear view.
                            </p>
                        </motion.div>
                    )}

                </div>
            </div>
            <Footer />
        </>
    );
};

export default AnalysisPage;
