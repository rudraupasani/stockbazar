import React, { useEffect, useState, useRef } from "react";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
} from "chart.js";
import { motion, useAnimation } from "framer-motion";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Filler);

const fallbackImage =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-yRzp5Y34fR97pNvBaJcIXCeLXMqOjGiUaF7ujovv3eFEvcKBC6jOSA-TYFSsZ0YeraQ&usqp=CAU";

const HomeTop10Live = () => {
  const [coins, setCoins] = useState([]);
  const sliderRef = useRef(null);
  const controls = useAnimation();
  const [width, setWidth] = useState(0);
  const [isHover, setIsHover] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    async function fetchTopGainers() {
      try {
        const res = await axios.get("http://localhost:5000/api/market/top-gainers");
        if (res.data.success) {
          const topCoins = res.data.gainers.map((coin) => {
            const min = coin.low_24h || coin.current_price * 0.98;
            const max = coin.high_24h || coin.current_price * 1.02;
            const miniChart = Array.from({ length: 20 }, () =>
              Number((min + Math.random() * (max - min)).toFixed(2))
            );
            return { ...coin, miniChart };
          });
          setCoins(topCoins);
        }
      } catch (err) {
        console.error("Failed to fetch top gainers:", err);
      }
    }
    fetchTopGainers();
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
            const newMiniChart = [...coin.miniChart, updated.current_price].slice(-20);
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

  useEffect(() => {
    if (sliderRef.current)
      setWidth(sliderRef.current.scrollWidth - sliderRef.current.offsetWidth);
  }, [coins]);

  useEffect(() => {
    if (!width) return;
    let isMounted = true;
    async function autoSlide() {
      while (isMounted) {
        if (!isHover) {
          await controls.start({ x: -width, transition: { duration: 22, ease: "linear" } });
          await controls.start({ x: 0, transition: { duration: 0.1 } });
        } else {
          await new Promise((res) => setTimeout(res, 500));
        }
      }
    }
    autoSlide();
    return () => { isMounted = false; };
  }, [width, isHover, controls]);

  return (
    <section className="w-full px-4 py-12" style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--accent-bg)" }}
          >
            <TrendingUp size={18} style={{ color: "var(--accent)" }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Today's Top Gainers
            </h2>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Live 24h performance
            </p>
          </div>
        </div>

        {/* Slider */}
        <div
          ref={sliderRef}
          className="overflow-hidden cursor-grab select-none"
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
        >
          <motion.div
            drag="x"
            animate={controls}
            dragConstraints={{ right: 0, left: -width }}
            className="flex gap-4"
          >
            {coins.slice(0, 10).map((c) => {
              const isUp = c.price_change_percentage_24h > 0;
              return (
                <motion.div
                  key={c.id ?? c.symbol}
                  whileHover={{ y: -4 }}
                  className="sb-card sb-card-accent min-w-[240px] p-5"
                >
                  {/* Coin Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={c.image || fallbackImage}
                      alt={c.name}
                      className="w-10 h-10 rounded-full"
                      onError={(e) => (e.target.src = fallbackImage)}
                    />
                    <div>
                      <h3
                        className="font-semibold text-sm leading-tight"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {c.name}
                      </h3>
                      <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                        {c.symbol?.toUpperCase()}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span className={isUp ? "sb-badge-up" : "sb-badge-down"}>
                        {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {c.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <p
                    className="text-xl font-extrabold mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    ₹{c.current_price?.toLocaleString()}
                  </p>

                  {/* Mini Chart */}
                  <div className="h-16">
                    <Line
                      data={{
                        labels: c.miniChart.map((_, i) => i),
                        datasets: [
                          {
                            data: c.miniChart,
                            fill: true,
                            backgroundColor: (context) => {
                              const ctx = context.chart.ctx;
                              const gradient = ctx.createLinearGradient(0, 0, 0, 64);
                              gradient.addColorStop(
                                0,
                                isUp ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"
                              );
                              gradient.addColorStop(1, "rgba(0,0,0,0)");
                              return gradient;
                            },
                            borderColor: isUp
                              ? "var(--green)"
                              : "var(--red)",
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
                      height={64}
                    />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeTop10Live;
