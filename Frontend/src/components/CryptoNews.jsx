import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, Clock } from "lucide-react";
import { useCrypto } from "../context/CryptoContext";

const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

const CryptoNews = () => {
    const { news } = useCrypto();

    if (!news || news.length === 0) return null;

    const displayNews = news.slice(0, 6);

    return (
        <section className="w-full px-4 py-12" style={{ backgroundColor: "var(--bg-surface)" }}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: "rgba(168,85,247,0.12)" }}
                    >
                        <Newspaper size={18} style={{ color: "#a855f7" }} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                            Market News
                        </h2>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Latest crypto & financial headlines
                        </p>
                    </div>
                </div>

                {/* News Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {displayNews.map((item, i) => (
                        <motion.a
                            key={i}
                            href={item.url || item.link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: i * 0.07 }}
                            viewport={{ once: true }}
                            whileHover={{ y: -3 }}
                            className="sb-card p-5 flex flex-col gap-3 cursor-pointer group"
                        >
                            {/* Image */}
                            {(item.imageurl || item.image_url) && (
                                <div className="w-full h-36 rounded-lg overflow-hidden">
                                    <img
                                        src={item.imageurl || item.image_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        onError={(e) => (e.target.style.display = "none")}
                                    />
                                </div>
                            )}

                            {/* Source tag */}
                            {item.source_info?.name && (
                                <span
                                    className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit"
                                    style={{ backgroundColor: "rgba(168,85,247,0.12)", color: "#a855f7" }}
                                >
                                    {item.source_info.name}
                                </span>
                            )}

                            {/* Title */}
                            <h3
                                className="text-sm font-semibold leading-snug line-clamp-3 group-hover:text-(--accent) transition-colors"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {item.title}
                            </h3>

                            {/* Body excerpt */}
                            {item.body && (
                                <p
                                    className="text-xs leading-relaxed line-clamp-2"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {item.body}
                                </p>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-auto pt-2">
                                <span
                                    className="flex items-center gap-1 text-xs"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    <Clock size={11} />
                                    {timeAgo(item.published_on ? new Date(item.published_on * 1000) : item.pubDate || item.publishedAt)}
                                </span>
                                <ExternalLink
                                    size={13}
                                    style={{ color: "var(--accent)" }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </div>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CryptoNews;
