import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Bookmark,
    BookmarkCheck,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Trash2,
    RefreshCw,
    PlusCircle,
    X,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
} from "chart.js";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

const fallbackImage =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-yRzp5Y34fR97pNvBaJcIXCeLXMqOjGiUaF7ujovv3eFEvcKBC6jOSA-TYFSsZ0YeraQ&usqp=CAU";

const STORAGE_KEY = "sb_watchlist";

const loadWatchlist = () => {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
        return [];
    }
};

const saveWatchlist = (list) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

const ChangeTag = ({ value }) => {
    const v = Number(value) || 0;
    const isUp = v > 0;
    return (
        <span className={isUp ? "sb-badge-up" : "sb-badge-down"}>
            {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(v).toFixed(2)}%
        </span>
    );
};

const WatchlistPage = () => {
    const [allCoins, setAllCoins] = useState([]);
    const [watchedSymbols, setWatchedSymbols] = useState(loadWatchlist);
    const [search, setSearch] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [loading, setLoading] = useState(true);

    // Fetch all coins
    useEffect(() => {
        async function fetch_() {
            try {
                setLoading(true);
                const res = await axios.get("http://localhost:5000/api/market/top-gainers");
                if (res.data.success) {
                    const coins = res.data.gainers.map((c) => ({
                        ...c,
                        miniChart: Array.from({ length: 20 }, () =>
                            Number(
                                (
                                    (c.low_24h || c.current_price * 0.97) +
                                    Math.random() *
                                    ((c.high_24h || c.current_price * 1.03) - (c.low_24h || c.current_price * 0.97))
                                ).toFixed(2)
                            )
                        ),
                    }));
                    setAllCoins(coins);
                }
            } catch (err) {
                console.error("Failed to fetch coins:", err);
            } finally {
                setLoading(false);
            }
        }
        fetch_();
    }, []);

    // Live price WebSocket
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:5000/ws/live-prices");
        ws.onmessage = (msg) => {
            try {
                const live = JSON.parse(msg.data);
                setAllCoins((prev) =>
                    prev.map((coin) => {
                        const u = live.find((d) => d.symbol === coin.symbol);
                        if (!u) return coin;
                        return {
                            ...coin,
                            ...u,
                            miniChart: [...coin.miniChart.slice(1), u.current_price],
                        };
                    })
                );
            } catch { }
        };
        return () => ws.close();
    }, []);

    // Persist watchlist
    useEffect(() => {
        saveWatchlist(watchedSymbols);
    }, [watchedSymbols]);

    const toggleWatch = (symbol) => {
        setWatchedSymbols((prev) =>
            prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
        );
    };

    const removeFromWatchlist = (symbol) => {
        setWatchedSymbols((prev) => prev.filter((s) => s !== symbol));
    };

    const watchedCoins = allCoins.filter((c) => watchedSymbols.includes(c.symbol));

    const searchResults = searchQuery.length >= 1
        ? allCoins.filter(
            (c) =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : allCoins.slice(0, 12);

    return (
        <>
            <Navbar />
            <div
                className="min-h-screen pt-20 pb-12 px-4"
                style={{ backgroundColor: "var(--bg-base)" }}
            >
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
                                    <Bookmark size={20} className="text-[var(--accent)]" />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                                        My Watchlist
                                    </h1>
                                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                        {watchedCoins.length} coin{watchedCoins.length !== 1 ? "s" : ""} tracked · live prices
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddPanel((v) => !v)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                            style={{
                                backgroundColor: showAddPanel ? "var(--accent)" : "var(--accent-bg)",
                                color: showAddPanel ? "#000" : "var(--accent)",
                                border: "1px solid var(--accent-border)",
                            }}
                        >
                            {showAddPanel ? <X size={16} /> : <PlusCircle size={16} />}
                            {showAddPanel ? "Close" : "Add Coins"}
                        </button>
                    </div>

                    {/* Add Coin Panel */}
                    <AnimatePresence>
                        {showAddPanel && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden mb-8"
                            >
                                <div className="sb-card p-6">
                                    <h3 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                                        Search & Add Coins
                                    </h3>

                                    {/* Search input */}
                                    <div className="relative mb-4 max-w-sm">
                                        <Search
                                            size={15}
                                            className="absolute left-3 top-1/2 -translate-y-1/2"
                                            style={{ color: "var(--text-muted)" }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search by name or symbol…"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                                            style={{
                                                backgroundColor: "var(--card-bg-hover)",
                                                border: "1px solid var(--border)",
                                                color: "var(--text-primary)",
                                            }}
                                            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                                            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                                        />
                                    </div>

                                    {/* Coin list */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-72 overflow-y-auto scrollbar-hide">
                                        {searchResults.map((coin) => {
                                            const isWatched = watchedSymbols.includes(coin.symbol);
                                            const isUp = coin.price_change_percentage_24h > 0;
                                            return (
                                                <button
                                                    key={coin.symbol}
                                                    onClick={() => toggleWatch(coin.symbol)}
                                                    className="flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                                                    style={{
                                                        backgroundColor: isWatched ? "var(--accent-bg)" : "var(--card-bg-hover)",
                                                        border: `1px solid ${isWatched ? "var(--accent-border)" : "var(--border)"}`,
                                                    }}
                                                >
                                                    <img
                                                        src={coin.image || fallbackImage}
                                                        alt={coin.name}
                                                        className="w-8 h-8 rounded-full flex-shrink-0"
                                                        onError={(e) => (e.target.src = fallbackImage)}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold truncate" style={{ color: "var(--text-primary)" }}>
                                                            {coin.symbol?.toUpperCase()}
                                                        </p>
                                                        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                                            {coin.name}
                                                        </p>
                                                    </div>
                                                    {isWatched ? (
                                                        <BookmarkCheck size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
                                                    ) : (
                                                        <Bookmark size={15} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Empty State */}
                    {watchedCoins.length === 0 && !loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="sb-card p-16 text-center"
                        >
                            <Bookmark size={48} className="mx-auto mb-4 opacity-25" style={{ color: "var(--text-muted)" }} />
                            <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                                Your watchlist is empty
                            </h3>
                            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
                                Add coins to track their live prices and performance.
                            </p>
                            <button
                                onClick={() => setShowAddPanel(true)}
                                className="sb-btn-primary inline-flex items-center gap-2"
                            >
                                <PlusCircle size={16} /> Add Your First Coin
                            </button>
                        </motion.div>
                    )}

                    {/* Watched Coin Cards */}
                    {watchedCoins.length > 0 && (
                        <>
                            {/* Summary Bar */}
                            <div
                                className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 rounded-2xl border"
                                style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border)" }}
                            >
                                {[
                                    { label: "Coins Tracked", value: watchedCoins.length },
                                    {
                                        label: "Gainers",
                                        value: watchedCoins.filter((c) => c.price_change_percentage_24h > 0).length,
                                        color: "var(--green)",
                                    },
                                    {
                                        label: "Losers",
                                        value: watchedCoins.filter((c) => c.price_change_percentage_24h <= 0).length,
                                        color: "var(--red)",
                                    },
                                    {
                                        label: "Best 24h",
                                        value:
                                            watchedCoins.length > 0
                                                ? `+${Math.max(...watchedCoins.map((c) => c.price_change_percentage_24h || 0)).toFixed(1)}%`
                                                : "—",
                                        color: "var(--green)",
                                    },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="text-center py-1">
                                        <p className="text-lg font-extrabold" style={{ color: color || "var(--text-primary)" }}>
                                            {value}
                                        </p>
                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                            {label}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                <AnimatePresence>
                                    {watchedCoins.map((c, i) => {
                                        const isUp = c.price_change_percentage_24h > 0;
                                        return (
                                            <motion.div
                                                key={c.symbol}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.25, delay: i * 0.04 }}
                                                className="sb-card p-5 relative group"
                                            >
                                                {/* Remove button */}
                                                <button
                                                    onClick={() => removeFromWatchlist(c.symbol)}
                                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: "rgba(239,68,68,0.12)", color: "#ef4444" }}
                                                >
                                                    <Trash2 size={13} />
                                                </button>

                                                {/* Header */}
                                                <div className="flex items-center gap-3 mb-4 pr-6">
                                                    <img
                                                        src={c.image || fallbackImage}
                                                        alt={c.name}
                                                        className="w-10 h-10 rounded-full"
                                                        onError={(e) => (e.target.src = fallbackImage)}
                                                    />
                                                    <div>
                                                        <h3 className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                                                            {c.name}
                                                        </h3>
                                                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                            {c.symbol?.toUpperCase()}
                                                        </p>
                                                    </div>
                                                    <div className="ml-auto">
                                                        <ChangeTag value={c.price_change_percentage_24h} />
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <div className="flex items-end justify-between mb-3">
                                                    <div>
                                                        <p className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                                                            ₹{c.current_price?.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                                                        <RefreshCw size={10} className="animate-spin" />
                                                        Live
                                                    </div>
                                                </div>

                                                {/* Mini chart */}
                                                <div className="h-16">
                                                    <Line
                                                        data={{
                                                            labels: c.miniChart?.map((_, i) => i) || [],
                                                            datasets: [
                                                                {
                                                                    data: c.miniChart || [],
                                                                    fill: true,
                                                                    backgroundColor: (ctx) => {
                                                                        const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 64);
                                                                        gradient.addColorStop(0, isUp ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)");
                                                                        gradient.addColorStop(1, "rgba(0,0,0,0)");
                                                                        return gradient;
                                                                    },
                                                                    borderColor: isUp ? "#22c55e" : "#ef4444",
                                                                    borderWidth: 2,
                                                                    tension: 0.4,
                                                                    pointRadius: 0,
                                                                },
                                                            ],
                                                        }}
                                                        options={{
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: { legend: { display: false }, tooltip: { enabled: false } },
                                                            scales: { x: { display: false }, y: { display: false } },
                                                        }}
                                                    />
                                                </div>

                                                {/* High / Low */}
                                                <div
                                                    className="flex justify-between mt-3 pt-3 text-xs border-t"
                                                    style={{ borderTopColor: "var(--border)", color: "var(--text-muted)" }}
                                                >
                                                    <span>H ₹{c.high_24h?.toLocaleString()}</span>
                                                    <span>L ₹{c.low_24h?.toLocaleString()}</span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default WatchlistPage;
