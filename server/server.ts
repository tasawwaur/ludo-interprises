import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

// Serve static assets from the Vite frontend build folder
const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

app.get("/api/status", (req, res) => {
  res.json({ status: "online", service: "LUDO-ENTERPRISE Multiplayer Server", timestamp: Date.now() });
});


interface RoomTimerState {
  roomCode: string;
  p1SocketId: string;
  p2SocketId: string;
  p1Color: string;
  p2Color: string;
  activeColor: string;
  gameStatus: 'ROLL_WAIT' | 'MOVE_WAIT' | 'GAME_OVER';
  secondsRemaining: number;
  intervalId?: NodeJS.Timeout;
}

const activeRooms = new Map<string, RoomTimerState>();

function startRoomTimer(room: RoomTimerState, duration = 15) {
  if (room.intervalId) clearInterval(room.intervalId);
  room.secondsRemaining = duration;

  io.to(room.roomCode).emit("timer_tick", {
    seconds: room.secondsRemaining,
    activeColor: room.activeColor,
    gameStatus: room.gameStatus,
  });

  room.intervalId = setInterval(() => {
    if (room.gameStatus === 'GAME_OVER') {
      clearInterval(room.intervalId);
      return;
    }

    room.secondsRemaining--;

    io.to(room.roomCode).emit("timer_tick", {
      seconds: room.secondsRemaining,
      activeColor: room.activeColor,
      gameStatus: room.gameStatus,
    });

    if (room.secondsRemaining <= 0) {
      clearInterval(room.intervalId);
      handleTimeout(room);
    }
  }, 1000);
}

function handleTimeout(room: RoomTimerState) {
  const timedOutColor = room.activeColor;
  const nextColor = timedOutColor === room.p1Color ? room.p2Color : room.p1Color;

  room.activeColor = nextColor;
  room.gameStatus = 'ROLL_WAIT';

  console.log(`[Authoritative Timer] Timeout in ${room.roomCode} for ${timedOutColor}. Passing turn to ${nextColor}.`);

  io.to(room.roomCode).emit("timer_timeout", {
    timedOutColor,
    nextColor,
  });

  startRoomTimer(room);
}

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

      // Randomly select Pair A (BLUE vs GREEN) or Pair B (RED vs YELLOW)
      const selectedPair = Math.random() < 0.5 ? "PAIR_A" : "PAIR_B";
      const swapColors = Math.random() < 0.5;
      const p1Color = selectedPair === "PAIR_A"
        ? (swapColors ? "BLUE" : "GREEN")
        : (swapColors ? "RED" : "YELLOW");
      const p2Color = selectedPair === "PAIR_A"
        ? (swapColors ? "GREEN" : "BLUE")
        : (swapColors ? "YELLOW" : "RED");

      console.log(`[Matchmaking] Match Created: ${player1.name} (${p1Color}) vs ${player2.name} (${p2Color}) in ${roomCode}`);

      // Register the room state for authoritative turn timers
      const roomState: RoomTimerState = {
        roomCode,
        p1SocketId: player1.socketId,
        p2SocketId: player2.socketId,
        p1Color,
        p2Color,
        activeColor: p1Color,
        gameStatus: 'ROLL_WAIT',
        secondsRemaining: 15,
      };
      activeRooms.set(roomCode, roomState);

      // Notify Player 1
      io.to(player1.socketId).emit("match_found", {
        roomCode,
        opponent: { 
          id: player2.userId, 
          name: player2.name, 
          avatar: player2.avatar,
          profileFrame: player2.profileFrame,
          nameBanner: player2.nameBanner,
          color: p2Color,
        },
        color: p1Color,
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
          color: p1Color,
        },
        color: p2Color,
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

  // Join Room Game (multiplayer timer synchronization)
  socket.on("join_room_game", (data: { roomCode: string }) => {
    socket.join(data.roomCode);
    console.log(`[Socket] Player (${socket.id}) joined game room ${data.roomCode}`);
    const room = activeRooms.get(data.roomCode);
    if (room) {
      // Start room timer if not already running
      if (!room.intervalId) {
        startRoomTimer(room);
      }
    }
  });

  // Authoritative action update from client
  socket.on("client_action", (data: { roomCode: string; actionType: 'ROLL' | 'MOVE' | 'UNDO'; nextColor?: string; isGameOver?: boolean; diceValue?: number; tokenId?: string; cost?: number }) => {
    const room = activeRooms.get(data.roomCode);
    if (!room) return;

    console.log(`[Authoritative Timer] Action ${data.actionType} received in ${data.roomCode}`, data);

    // Broadcast the action to the other player in the room
    socket.to(data.roomCode).emit("server_action", data);

    if (data.isGameOver) {
      room.gameStatus = 'GAME_OVER';
      if (room.intervalId) clearInterval(room.intervalId);
      return;
    }

    if (data.actionType === 'ROLL') {
      room.gameStatus = 'MOVE_WAIT';
      // If player has no legal moves, give them only 5 seconds for Protection/Undo, otherwise 10 seconds
      const hasLegalMoves = data.hasLegalMoves !== false;
      const duration = hasLegalMoves ? 10 : 5;
      startRoomTimer(room, duration);
    } else if (data.actionType === 'MOVE') {
      room.gameStatus = 'ROLL_WAIT';
      if (data.nextColor) {
        room.activeColor = data.nextColor;
      }
      startRoomTimer(room, 15);
    } else if (data.actionType === 'UNDO') {
      room.gameStatus = 'ROLL_WAIT';
      // Undo resets timer back to 15s to let the player roll again
      startRoomTimer(room, 15);
    }
  });

  socket.on("disconnect", () => {
    const idx = matchmakingQueue.findIndex((p) => p.socketId === socket.id);
    if (idx !== -1) matchmakingQueue.splice(idx, 1);
    console.log("Player disconnected:", socket.id);

    // Stop active room timers if player disconnected
    for (const [code, room] of activeRooms.entries()) {
      if (room.p1SocketId === socket.id || room.p2SocketId === socket.id) {
        if (room.intervalId) clearInterval(room.intervalId);
        activeRooms.delete(code);
        console.log(`[Authoritative Timer] Cleaned up room ${code} due to disconnect`);
      }
    }
  });
// Fallback all non-API GET requests to index.html (SPA routing)
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/socket.io")) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      next();
    }
  });
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Ludo Enterprise Server running on port ${PORT}`);
});

