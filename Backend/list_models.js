const axios = require("axios");

const API_KEY = "AIzaSyBYIg2iWrXw_Ru6PrBp7_jfc3Xwq4I4kGo";

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const res = await axios.get(url);
        console.log("Available models:");
        res.data.models.forEach(m => console.log(m.name));
    } catch (err) {
        console.error(`❌ Failed to list models: ${err.response?.status}`);
        if (err.response?.data) {
            console.error(`Error Details: ${JSON.stringify(err.response.data.error)}`);
        } else {
            console.error(`Error Message: ${err.message}`);
        }
    }
}

listModels();
