const SCHEMA_TEMPLATE = {
    trend: "Unknown",
    trend_score: 50,
    momentum: "Neutral",
    volatility: "Low",
    support: "N/A",
    resistance: "N/A",
    stop_loss: "N/A",
    take_profit: "N/A",
    sentiment: "Neutral",
    whale_activity: "Neutral",
    pattern: "None",
    prediction_24h: "Stable",
    prediction_7d: "Stable",
    risk: "Low",
    confidence: 50,
    grade: "C",
    buy_signal: "Hold",
    summary_beginner: "No analysis available.",
    summary_advanced: "No analysis available.",
    key_levels: []
};

function parseTaggedText(text, schema) {
    const result = {};
    for (const key in schema) {
        const tag = key.toUpperCase();
        const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)(?:\\[\\/${tag}\\]|$)`, "i");
        const match = text.match(regex);
        if (match) {
            let val = match[1].trim();
            if (typeof schema[key] === "number") {
                val = parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
            } else if (Array.isArray(schema[key])) {
                val = val.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
            }
            result[key] = val;
        } else {
            result[key] = schema[key];
        }
    }
    return result;
}

const tests = [
    {
        name: "Perfect response",
        text: "[TREND]Bullish[/TREND] [TREND_SCORE]85[/TREND_SCORE] [MOMENTUM]Strong Up[/MOMENTUM] [KEY_LEVELS]₹80k, ₹90k[/KEY_LEVELS]",
        expected: { trend: "Bullish", trend_score: 85, momentum: "Strong Up", key_levels: ["₹80k", "₹90k"] }
    },
    {
        name: "Truncated response (no closing tag)",
        text: "[TREND]Bullish",
        expected: { trend: "Bullish" }
    },
    {
        name: "Extra chatter and markdown",
        text: "Here is your analysis:\n```\n[TREND] Bearish [/TREND]\n```\nSome other text.",
        expected: { trend: "Bearish" }
    },
    {
        name: "Missing fields (use defaults)",
        text: "[PATTERN]Breakout[/PATTERN]",
        expected: { pattern: "Breakout", trend: "Unknown" }
    },
    {
        name: "Number cleaning",
        text: "[TREND_SCORE] ~95.5% [/TREND_SCORE]",
        expected: { trend_score: 95.5 }
    }
];

let failed = 0;
tests.forEach(t => {
    const res = parseTaggedText(t.text, SCHEMA_TEMPLATE);
    console.log(`Test: ${t.name}`);
    let match = true;
    for (const key in t.expected) {
        if (JSON.stringify(res[key]) !== JSON.stringify(t.expected[key])) {
            console.error(`  ❌ Failed ${key}: expected ${JSON.stringify(t.expected[key])}, got ${JSON.stringify(res[key])}`);
            match = false;
        }
    }
    if (match) console.log("  ✅ Passed");
    else failed++;
});

if (failed === 0) {
    console.log("\n✨ ALL PARSER TESTS PASSED! ✨");
} else {
    console.log(`\n❌ ${failed} tests failed.`);
    process.exit(1);
}
