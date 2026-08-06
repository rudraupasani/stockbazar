const axios = require("axios");

async function testLocalCoins() {
    try {
        console.log("Fetching from http://localhost:5000/api/ai/coins ...");
        const res = await axios.get("http://localhost:5000/api/ai/coins");
        console.log("Success:", res.data.success);
        if (res.data.success) {
            console.log(`Found ${res.data.coins.length} coins.`);
            if (res.data.coins.length > 0) {
                console.log("Sample coin:", res.data.coins[0].symbol);
            }
        } else {
            console.log("Error message:", res.data.message);
        }
    } catch (err) {
        console.error("Local request failed:", err.message);
    }
}

testLocalCoins();
