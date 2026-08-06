require("dotenv").config();
const express = require("express");
const http = require("http");

const app = express();
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Running on ${PORT}`);
});