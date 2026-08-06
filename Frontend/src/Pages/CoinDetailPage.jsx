import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, BarChart3, TrendingUp, Activity, DollarSign } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const fallbackImage =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-yRzp5Y34fR97pNvBaJcIXCeLXMqOjGiUaF7ujovv3eFEvcKBC6jOSA-TYFSsZ0YeraQ&usqp=CAU";

const ChangePill = ({ value }) => {
  const v = Number(value) || 0;
  const isUp = v > 0;
  return (
    <span className={isUp ? "sb-badge-up" : "sb-badge-down"}>
      {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      {Math.abs(v).toFixed(2)}%
    </span>
  );
};

const CoinDetailPage = () => {
  const { symbol } = useParams();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoin = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/market/top-gainers");
        if (res.data.success) {
          const match = res.data.gainers.find(
            (item) => item.symbol?.toLowerCase() === symbol?.toLowerCase()
          );
          setCoin(match || res.data.gainers[0] || null);
        }
      } catch (err) {
        console.error("Failed to load coin details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoin();
  }, [symbol]);

  const chartData = useMemo(() => {
    if (!coin) return null;
    return {
      labels: ["1h", "24h", "7d"],
      datasets: [
        {
          label: "Change %",
          data: [
            Number(coin.price_change_percentage_1h || 0),
            Number(coin.price_change_percentage_24h || 0),
            Number(coin.price_change_percentage_7d || 0),
          ],
          backgroundColor: ["#3b82f6", "#22c55e", "#f59e0b"],
          borderRadius: 10,
          maxBarThickness: 44,
        },
      ],
    };
  }, [coin]);

  return (
    <>
      <Navbar />
      <section className="min-h-screen pt-24 pb-12 px-4" style={{ backgroundColor: "var(--bg-base)" }}>
        <div className="max-w-7xl mx-auto space-y-6">
          <Link
            to="/market"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: "var(--accent-bg)", color: "var(--accent)" }}
          >
            <ArrowLeft size={16} />
            Back to market
          </Link>

          {loading ? (
            <div className="sb-card p-10 text-center">
              <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Loading coin details...
              </p>
            </div>
          ) : !coin ? (
            <div className="sb-card p-10 text-center">
              <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Coin not found.
              </p>
            </div>
          ) : (
            <>
              <div className="sb-card p-6 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <img
                      src={coin.image || fallbackImage}
                      alt={coin.name}
                      className="w-14 h-14 rounded-full"
                      onError={(e) => (e.target.src = fallbackImage)}
                    />
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>
                        Live market snapshot
                      </p>
                      <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
                        {coin.name}
                      </h1>
                      <p className="text-base" style={{ color: "var(--text-secondary)" }}>
                        {coin.symbol?.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="text-left lg:text-right">
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      Current price
                    </p>
                    <p className="text-4xl font-black" style={{ color: "var(--text-primary)" }}>
                      ₹{coin.current_price?.toLocaleString()}
                    </p>
                    <div className="mt-2 flex lg:justify-end">
                      <ChangePill value={coin.price_change_percentage_24h} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
                <div className="sb-card p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em]" style={{ color: "var(--text-muted)" }}>
                        Momentum chart
                      </p>
                      <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                        Performance across timeframes
                      </h2>
                    </div>
                    <div className="flex items-center gap-2 rounded-full px-3 py-2" style={{ backgroundColor: "var(--accent-bg)", color: "var(--accent)" }}>
                      <BarChart3 size={16} />
                      <span className="text-sm font-semibold">Bar view</span>
                    </div>
                  </div>

                  {chartData && (
                    <div className="h-72">
                      <Bar
                        data={chartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false }, tooltip: { enabled: true } },
                          scales: {
                            x: { grid: { display: false } },
                            y: { grid: { color: "var(--border)" }, ticks: { color: "var(--text-muted)" } },
                          },
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="sb-card p-6">
                    <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                      Market stats
                    </h3>
                    <div className="grid gap-3">
                      {[
                        { label: "24h high", value: `₹${Number(coin.high_24h || 0).toLocaleString()}`, icon: DollarSign },
                        { label: "24h low", value: `₹${Number(coin.low_24h || 0).toLocaleString()}`, icon: Activity },
                        { label: "Volume", value: `₹${Number(coin.volume || 0).toLocaleString()}`, icon: TrendingUp },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex items-center justify-between rounded-xl p-3" style={{ backgroundColor: "var(--card-bg-hover)" }}>
                          <div className="flex items-center gap-2">
                            <Icon size={15} style={{ color: "var(--accent)" }} />
                            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                              {label}
                            </span>
                          </div>
                          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </>
  );
};

export default CoinDetailPage;
