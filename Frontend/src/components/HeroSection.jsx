import React from "react";
import { Sparkles, BarChart3, Brain, ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const cards = [
  {
    title: "Market Trends",
    desc: "Live trend detection powered by AI.",
    icon: BarChart3,
    color: "#3b82f6",
    colorBg: "rgba(59,130,246,0.12)",
  },
  {
    title: "Prediction Engine",
    desc: "AI analyses volatility & price action.",
    icon: Brain,
    color: "#8b5cf6",
    colorBg: "rgba(139,92,246,0.12)",
  },
  {
    title: "Smart Insights",
    desc: "System suggests good entry/exit moments.",
    icon: Sparkles,
    color: "#f59e0b",
    colorBg: "rgba(245,158,11,0.12)",
  },
];

const Hero = () => {
  return (
    <section
      className="relative pt-28 pb-24 overflow-hidden"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* Background gradient blobs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] rounded-full opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(245,158,11,0.35) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[300px] opacity-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(59,130,246,0.5) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
          style={{
            backgroundColor: "var(--accent-bg)",
            borderColor: "var(--accent-border)",
            color: "var(--accent)",
            border: "1px solid",
          }}
        >
          <Zap size={14} />
          AI-Powered Market Intelligence
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          Trade Smarter with
          <span
            className="block mt-1"
            style={{
              background:
                "linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #f97316 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            AI Intelligence
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-5 text-lg max-w-2xl mx-auto leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          StockBazar uses advanced AI to track market movements, detect
          trends, predict volatility, and help you make smarter trading decisions in real time.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to="/analysis"
            className="sb-btn-primary flex items-center gap-2 shadow-lg"
            style={{ boxShadow: "0 8px 24px rgba(245,158,11,0.25)" }}
          >
            Start AI Analysis
            <ArrowRight size={16} />
          </Link>

          <Link
            to="/market"
            className="sb-btn-ghost flex items-center gap-2"
          >
            View Live Market
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-8"
        >
          {[
            { label: "Live Coins", value: "200+" },
            { label: "Accuracy", value: "94%" },
            { label: "Updates/sec", value: "Real-time" },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p
                className="text-2xl font-extrabold"
                style={{ color: "var(--accent)" }}
              >
                {value}
              </p>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
                {label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.7 },
            },
          }}
          className="mt-16 flex flex-wrap justify-center gap-5"
        >
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                variants={{
                  hidden: { opacity: 0, y: 40, scale: 0.95 },
                  show: { opacity: 1, y: 0, scale: 1 },
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="sb-card w-72 p-6 text-left cursor-default"
              >
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: card.colorBg }}
                >
                  <Icon size={22} style={{ color: card.color }} />
                </div>

                <h3
                  className="text-base font-bold mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {card.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
