const axios = require("axios");

async function testCoins() {
    try {
        console.log("Fetching coins from Binance...");
        const { data } = await axios.get("https://api.binance.com/api/v3/ticker/24hr");
        console.log(`Fetched ${data.length} tickers from Binance.`);

        const popular = ["BTC", "ETH", "BNB"];
        const found = data.filter(c => popular.some(p => c.symbol === `${p}USDT`));
        console.log("Sample matches:", found.map(f => f.symbol));

        if (found.length === 0) {
            console.log("No matches found for popular coins. Checking raw data for first 5 tickers:");
            console.log(data.slice(0, 5).map(c => c.symbol));
        }
    } catch (err) {
        console.error("Error fetching from Binance:", err.message);
        if (err.response) {
            console.error("Status:", err.response.status);
            console.error("Data:", err.response.data);
        }
    }
}

testCoins();
