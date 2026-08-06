import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const MarketBarChart = () => {
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/market/top-gainers");
        if (res.data.success) {
          setCoins(res.data.gainers.slice(0, 8));
        }
      } catch (err) {
        console.error("Bar chart fetch error:", err);
      }
    };

    fetchData();
  }, []);

  const chartData = useMemo(() => ({
    labels: coins.map((coin) => coin.symbol?.toUpperCase() || "-"),
    datasets: [
      {
        label: "24h %",
        data: coins.map((coin) => Number(coin.price_change_percentage_24h || 0)),
        backgroundColor: coins.map((coin) =>
          Number(coin.price_change_percentage_24h || 0) >= 0 ? "#22c55e" : "#ef4444"
        ),
        borderRadius: 8,
      },
    ],
  }), [coins]);

  return (
    <section className="w-full px-4 py-12" style={{ backgroundColor: "var(--bg-base)" }}>
      <div className="max-w-7xl mx-auto">
        <div className="sb-card p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--accent)" }}>
                Market bar chart
              </p>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                24h performance snapshot
              </h2>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Compare the strongest and weakest movers at a glance.
            </p>
          </div>

          <div className="h-80">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: true } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: "var(--text-muted)" } },
                  y: { grid: { color: "var(--border)" }, ticks: { color: "var(--text-muted)" } },
                },
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketBarChart;
