import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Cpu, ShieldCheck, BarChart3, Zap } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Real-time crypto & stock prices",
    color: "#3b82f6",
    colorBg: "rgba(59,130,246,0.12)",
  },
  {
    icon: BarChart3,
    title: "AI-powered buy/sell predictions",
    color: "#22c55e",
    colorBg: "rgba(34,197,94,0.12)",
  },
  {
    icon: Cpu,
    title: "Support & resistance levels",
    color: "#f59e0b",
    colorBg: "rgba(245,158,11,0.12)",
  },
  {
    icon: ShieldCheck,
    title: "Multi-exchange secure data",
    color: "#a855f7",
    colorBg: "rgba(168,85,247,0.12)",
  },
  {
    icon: Zap,
    title: "Fast & optimized real-time backend",
    color: "#ec4899",
    colorBg: "rgba(236,72,153,0.12)",
  },
];

const WhyStockBazar = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true }}
      className="sb-card p-6 md:p-7"
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
          Why StockBazar?
        </h2>
        <div
          className="w-10 h-0.5 mt-2 rounded-full"
          style={{ background: "linear-gradient(90deg, #3b82f6, #22c55e)" }}
        />
      </div>

      {/* Features */}
      <div className="space-y-3">
        {features.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="group flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 cursor-default"
              style={{
                backgroundColor: "var(--card-bg-hover)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = item.color + "55";
                e.currentTarget.style.backgroundColor = item.colorBg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.backgroundColor = "var(--card-bg-hover)";
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: item.colorBg }}
              >
                <Icon size={18} style={{ color: item.color }} />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {item.title}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default WhyStockBazar;
