import React from "react";
import { motion } from "framer-motion";

const tools = [
  { title: "Crypto Screener", icon: "📊", desc: "Filter coins by metrics" },
  { title: "Stock Screener", icon: "📈", desc: "Find your next trade" },
  { title: "AI Buy/Sell", icon: "🤖", desc: "Smart trade signals" },
  { title: "Market News", icon: "📰", desc: "Live news & updates" },
  { title: "Portfolio", icon: "💼", desc: "Track your holdings" },
  { title: "Alerts", icon: "🔔", desc: "Price notifications" },
];

const FeaturedTools = () => {
  return (
    <div className="sb-card p-6 md:p-7">
      <div className="mb-6">
        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Featured Tools
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Everything you need to trade smarter
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {tools.map((t, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            className="p-4 rounded-xl cursor-pointer transition-all duration-200 text-center"
            style={{
              backgroundColor: "var(--card-bg-hover)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.backgroundColor = "var(--accent-bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.backgroundColor = "var(--card-bg-hover)";
            }}
          >
            <div className="text-2xl mb-2">{t.icon}</div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {t.title}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {t.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedTools;
