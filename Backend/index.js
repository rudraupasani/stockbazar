// index.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");
const topGainersRoute = require("./routes/market.routes"); // your module
const AiRoute = require("./routes/Ai.routes"); // your module
const app = express();
app.use(cors());
app.use(express.json());

// ⚡ HTTP Route
app.use("/api/market", topGainersRoute);
app.use("/api/ai", AiRoute);

// ⚡ HTTP server
const server = http.createServer(app);

// ⚡ WebSocket server
const wss = new WebSocket.Server({ server, path: "/ws/live-prices" });

// Attach WebSocket live feed
topGainersRoute.wsLivePrices(wss);

// Start server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}/ws/live-prices`);
});
