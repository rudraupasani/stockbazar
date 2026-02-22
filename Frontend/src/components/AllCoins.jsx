import React, { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Search, SlidersHorizontal } from "lucide-react";
import { Line } from "react-chartjs-2";
import axios from "axios";
import Footer from "./Footer";
import Navbar from "./Navbar";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const fallbackImage =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-yRzp5Y34fR97pNvBaJcIXCeLXMqOjGiUaF7ujovv3eFEvcKBC6jOSA-TYFSsZ0YeraQ&usqp=CAU";

const ChangeTag = ({ value }) => {
  const v = Number(value) || 0;
  const isUp = v > 0;
  return (
    <span className={isUp ? "sb-badge-up" : "sb-badge-down"}>
      {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {v.toFixed(2)}%
    </span>
  );
};

const AllCoins = () => {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("gainers");

  useEffect(() => {
    async function fetchCoins() {
      try {
        const res = await axios.get("http://localhost:5000/api/market/top-gainers");
        if (res.data.success) {
          const coinsWithChart = res.data.gainers.map((c) => ({
            ...c,
            miniChart: Array(20).fill(c.current_price),
          }));
          setCoins(coinsWithChart);
        }
      } catch (err) {
        console.error("Failed to fetch coins:", err);
      }
    }
    fetchCoins();
  }, []);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000/ws/live-prices");
    ws.onmessage = (message) => {
      try {
        const liveData = JSON.parse(message.data);
        setCoins((prevCoins) =>
          prevCoins.map((coin) => {
            const updated = liveData.find((c) => c.symbol === coin.symbol);
            if (!updated) return coin;
            const newMiniChart = [...coin.miniChart.slice(1), updated.current_price];
            return { ...coin, ...updated, miniChart: newMiniChart };
          })
        );
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };
    ws.onerror = (err) => console.error("WebSocket error:", err);
    return () => ws.close();
  }, []);

  const filtered = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortType === "gainers") return b.price_change_percentage_24h - a.price_change_percentage_24h;
    if (sortType === "losers") return a.price_change_percentage_24h - b.price_change_percentage_24h;
    if (sortType === "price") return b.current_price - a.current_price;
    return 0;
  });

  return (
    <>
      <Navbar />
      <section
        className="min-h-screen pt-20 pb-12 px-4"
        style={{ backgroundColor: "var(--bg-base)" }}
      >
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              All Coins
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {sorted.length} coins · Live prices
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="Search coins..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <SlidersHorizontal
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
              <select
                value={sortType}
                onChange={(e) => setSortType(e.target.value)}
                className="pl-8 pr-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer transition-all"
                style={{
                  backgroundColor: "var(--card-bg)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <option value="gainers">Top Gainers</option>
                <option value="losers">Top Losers</option>
                <option value="price">By Price</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {sorted.map((c) => {
              const isUp = c.price_change_percentage_24h > 0;
              return (
                <div
                  key={c.symbol}
                  className="sb-card sb-card-accent p-5 transition-all duration-200"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
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
                        {c.symbol.toUpperCase()}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <ChangeTag value={c.price_change_percentage_24h} />
                    </div>
                  </div>

                  {/* Price */}
                  <p className="text-xl font-extrabold mb-3" style={{ color: "var(--text-primary)" }}>
                    ₹{c.current_price?.toLocaleString()}
                  </p>

                  {/* Mini Chart */}
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
                              gradient.addColorStop(
                                0,
                                isUp ? "rgba(34,197,94,0.20)" : "rgba(239,68,68,0.20)"
                              );
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
                    className="flex justify-between mt-3 pt-3 border-t text-xs"
                    style={{ borderTopColor: "var(--border)", color: "var(--text-muted)" }}
                  >
                    <span>H: ₹{c.high_24h?.toLocaleString()}</span>
                    <span>L: ₹{c.low_24h?.toLocaleString()}</span>
                  </div>
                  <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                    Vol: ₹{c.volume?.toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default AllCoins;
