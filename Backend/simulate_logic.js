const axios = require("axios");

async function simulate() {
    try {
        const { data } = await axios.get("https://api.binance.com/api/v3/ticker/24hr");
        const popular = ["BTC", "ETH", "BNB"];
        const avoid = ["UP", "DOWN", "BULL", "BEAR"];

        const coins = popular.map((symbol) => {
            const found = data.find(
                (c) =>
                    c.symbol === `${symbol}USDT` &&
                    !avoid.some((t) => c.symbol.includes(t))
            );
            if (!found) return null;
            return { symbol };
        }).filter(Boolean);

        console.log(`Simulation result: found ${coins.length} coins.`);
        console.log("Coins:", coins.map(c => c.symbol));
    } catch (err) {
        console.error("Simulation failed:", err.message);
    }
}

simulate();
