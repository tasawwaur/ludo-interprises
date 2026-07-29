import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

app.get("/api/status", (req, res) => {
  res.json({ status: "online", service: "LUDO-ENTERPRISE Multiplayer Server", timestamp: Date.now() });
});

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);
  socket.on("disconnect", () => console.log("Player disconnected:", socket.id));
});

const PORT = 8000;
httpServer.listen(PORT, () => {
  console.log(`Ludo Enterprise Server running on http://localhost:${PORT}`);
});
