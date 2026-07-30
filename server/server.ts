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

interface WaitingPlayer {
  socketId: string;
  userId: string;
  name: string;
  avatar?: string;
  profileFrame?: string;
  nameBanner?: string;
}

const matchmakingQueue: WaitingPlayer[] = [];

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Player joins Matchmaking Queue
  socket.on("join_queue", (playerData: { userId: string; name: string; avatar?: string; profileFrame?: string; nameBanner?: string }) => {
    console.log(`[Queue] ${playerData.name} (${socket.id}) joined queue`);

    // Remove if already in queue
    const existingIdx = matchmakingQueue.findIndex((p) => p.socketId === socket.id);
    if (existingIdx !== -1) matchmakingQueue.splice(existingIdx, 1);

    matchmakingQueue.push({
      socketId: socket.id,
      userId: playerData.userId,
      name: playerData.name,
      avatar: playerData.avatar,
      profileFrame: playerData.profileFrame,
      nameBanner: playerData.nameBanner,
    });

    // Check if 2 real players are waiting in queue
    if (matchmakingQueue.length >= 2) {
      const player1 = matchmakingQueue.shift()!;
      const player2 = matchmakingQueue.shift()!;
      const roomCode = "ROOM_" + Math.random().toString(36).substring(2, 8).toUpperCase();

      console.log(`[Matchmaking] Match Created: ${player1.name} vs ${player2.name} in ${roomCode}`);

      // Notify Player 1
      io.to(player1.socketId).emit("match_found", {
        roomCode,
        opponent: { 
          id: player2.userId, 
          name: player2.name, 
          avatar: player2.avatar,
          profileFrame: player2.profileFrame,
          nameBanner: player2.nameBanner,
        },
        color: "GREEN",
        isHost: true,
      });

      // Notify Player 2
      io.to(player2.socketId).emit("match_found", {
        roomCode,
        opponent: { 
          id: player1.userId, 
          name: player1.name, 
          avatar: player1.avatar,
          profileFrame: player1.profileFrame,
          nameBanner: player1.nameBanner,
        },
        color: "YELLOW",
        isHost: false,
      });
    }
  });

  // Leave Matchmaking Queue
  socket.on("leave_queue", () => {
    const idx = matchmakingQueue.findIndex((p) => p.socketId === socket.id);
    if (idx !== -1) {
      matchmakingQueue.splice(idx, 1);
      console.log(`[Queue] Player (${socket.id}) left queue`);
    }
  });

  socket.on("disconnect", () => {
    const idx = matchmakingQueue.findIndex((p) => p.socketId === socket.id);
    if (idx !== -1) matchmakingQueue.splice(idx, 1);
    console.log("Player disconnected:", socket.id);
  });
});

const PORT = 8080;
httpServer.listen(PORT, () => {
  console.log(`Ludo Enterprise Server running on http://localhost:${PORT}`);
});
