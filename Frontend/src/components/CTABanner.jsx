import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bot } from "lucide-react";
import { Link } from "react-router-dom";

const CTABanner = () => {
    return (
        <section className="w-full px-4 py-16" style={{ backgroundColor: "var(--bg-base)" }}>
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden rounded-2xl p-8 md:p-14 text-center"
                    style={{
                        background: "linear-gradient(135deg, #1a1004 0%, #0d1117 40%, #110a1e 100%)",
                        border: "1px solid rgba(245,158,11,0.15)",
                    }}
                >
                    {/* Glow */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background:
                                "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.18) 0%, transparent 65%)",
                        }}
                    />

                    <div className="relative">
                        <div
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
                            style={{
                                backgroundColor: "rgba(245,158,11,0.15)",
                                border: "1px solid rgba(245,158,11,0.25)",
                                color: "#f59e0b",
                            }}
                        >
                            <Bot size={14} />
                            Powered by Advanced AI
                        </div>

                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                            Let AI Trade Smarter
                            <br />
                            <span
                                style={{
                                    background: "linear-gradient(135deg, #f59e0b, #fbbf24, #f97316)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                For You
                            </span>
                        </h2>

                        <p className="text-gray-400 max-w-xl mx-auto mb-8 text-base leading-relaxed">
                            Get real-time AI market analysis, auto-detect buy/sell signals, and monitor your
                            watchlist — all in one powerful dashboard.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/analysis"
                                className="sb-btn-primary flex items-center gap-2"
                                style={{ boxShadow: "0 8px 32px rgba(245,158,11,0.30)" }}
                            >
                                Try AI Analysis <ArrowRight size={16} />
                            </Link>
                            <Link
                                to="/market"
                                className="px-6 py-2.5 rounded-xl font-semibold text-sm border transition-all"
                                style={{
                                    borderColor: "rgba(255,255,255,0.15)",
                                    color: "rgba(255,255,255,0.8)",
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                }}
                            >
                                Explore Market
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTABanner;
