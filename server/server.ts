import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import crypto from "crypto";
import https from "https";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually load env variables from root .env
try {
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const eqIdx = trimmed.indexOf("=");
        const key = trimmed.substring(0, eqIdx).trim();
        const value = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    });
    console.log("Loaded local .env file successfully.");
  }
} catch (e) {
  console.warn("Could not load local .env file:", e);
}

const app = express();
app.use(express.json());
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

// Create secure order for Razorpay payment
app.post("/api/payments/create-order", async (req, res) => {
  try {
    const { amount, packageName } = req.body;
    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const keyId = process.env.VITE_RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

    if (!keyId || !keySecret) {
      console.error("Razorpay API keys are missing in .env");
      return res.status(500).json({ message: "Payment gateway keys not configured on server" });
    }

    const amountInPaise = Math.round(amount * 100);
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const postData = JSON.stringify({
      amount: amountInPaise,
      currency: "INR",
      receipt: "ludo_rcpt_" + Date.now().toString().slice(-8)
    });

    const orderId = await new Promise<string>((resolve, reject) => {
      const options = {
        hostname: "api.razorpay.com",
        port: 443,
        path: "/v1/orders",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
          "Authorization": `Basic ${auth}`
        }
      };

      const rReq = https.request(options, (rRes) => {
        let body = "";
        rRes.on("data", (chunk) => (body += chunk));
        rRes.on("end", () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed && parsed.id) {
              resolve(parsed.id);
            } else {
              reject(new Error(parsed.error?.description || "Razorpay order creation failed"));
            }
          } catch (e) {
            reject(e);
          }
        });
      });

      rReq.on("error", (err) => reject(err));
      rReq.write(postData);
      rReq.end();
    });

    res.json({
      success: true,
      orderId,
      amount,
      currency: "INR",
      keyId,
      packageName
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: error.message || "Order creation failed" });
  }
});

// Secure server-side signature verification
app.post("/api/payments/verify-payment", async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;

    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({ message: "Verification parameters are missing" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    if (!secret) {
      return res.status(500).json({ message: "Payment gateway secret not configured" });
    }

    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(orderId + "|" + paymentId);
    const digest = shasum.digest("hex");
    const isVerified = digest === signature;

    if (!isVerified) {
      return res.status(400).json({ success: false, message: "Payment signature verification failed!" });
    }

    res.json({
      success: true,
      message: "Payment verified successfully!"
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: error.message || "Payment verification failed" });
  }
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
interface OnlineUser {
  socketId: string;
  userId: string;
  username: string;
  avatar?: string;
  equippedFrame?: string;
  level: number;
}
const connectedUsers = new Map<string, OnlineUser>(); // username/userId -> OnlineUser

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Register user for friend requests / match invites
  socket.on("register_user", (data: { userId: string; username: string; uid?: string; avatar?: string; equippedFrame?: string; level?: number }) => {
    const userRecord: OnlineUser = {
      socketId: socket.id,
      userId: data.userId,
      username: data.username,
      avatar: data.avatar,
      equippedFrame: data.equippedFrame,
      level: data.level || 1
    };
    connectedUsers.set(data.userId.toLowerCase(), userRecord);
    connectedUsers.set(data.username.toLowerCase(), userRecord);
    if (data.uid) {
      connectedUsers.set(data.uid.toLowerCase(), userRecord);
    }
    console.log(`[Register] User registered: ${data.username} / ${data.uid} (${socket.id})`);
  });

  // Search player handler
  socket.on("search_player", (data: { query: string }) => {
    const q = data.query.toLowerCase();
    const onlineUser = connectedUsers.get(q);
    if (onlineUser) {
      socket.emit("search_player_result", {
        found: true,
        id: onlineUser.userId,
        name: onlineUser.username,
        avatarUrl: onlineUser.avatar,
        equippedFrame: onlineUser.equippedFrame,
        level: onlineUser.level
      });
    } else {
      socket.emit("search_player_result", {
        found: false,
        query: data.query
      });
    }
  });

  socket.on("send_friend_request", (data: { 
    senderId: string; 
    senderName: string; 
    senderAvatar?: string;
    senderFrame?: string;
    senderLevel: number;
    targetId?: string;
    targetName: string; 
  }) => {
    console.log(`[Friend Request] From ${data.senderName} to ${data.targetName} (${data.targetId})`);
    let targetSocketId = null;
    if (data.targetId) {
      targetSocketId = connectedUsers.get(data.targetId.toLowerCase())?.socketId;
    }
    if (!targetSocketId) {
      targetSocketId = connectedUsers.get(data.targetName.toLowerCase())?.socketId;
    }

    if (targetSocketId) {
      io.to(targetSocketId).emit("incoming_friend_request", {
        id: data.senderId,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        senderFrame: data.senderFrame,
        senderLevel: data.senderLevel,
        time: "Just now"
      });
      socket.emit("friend_request_status", { success: true, message: `Request sent to ${data.targetName}!` });
    } else {
      socket.emit("friend_request_status", { success: false, message: `${data.targetName} is offline.` });
    }
  });

  socket.on("send_game_invite", (data: { 
    senderName: string; 
    senderAvatar?: string; 
    mode: string; 
    targetId?: string;
    targetName: string; 
  }) => {
    console.log(`[Game Invite] From ${data.senderName} to ${data.targetName} (${data.targetId})`);
    let targetSocketId = null;
    if (data.targetId) {
      targetSocketId = connectedUsers.get(data.targetId.toLowerCase())?.socketId;
    }
    if (!targetSocketId) {
      targetSocketId = connectedUsers.get(data.targetName.toLowerCase())?.socketId;
    }

    if (targetSocketId) {
      io.to(targetSocketId).emit("incoming_game_invite", {
        id: "inv_" + Date.now(),
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        mode: data.mode,
        time: "Just now"
      });
    }
  });

  socket.on("accept_friend_request", (data: { 
    senderId?: string;
    senderName: string; 
    receiverId: string;
    receiverName: string;
    receiverAvatar?: string;
    receiverFrame?: string;
    receiverLevel: number;
  }) => {
    console.log(`[Friend Request Accepted] From ${data.receiverName} to ${data.senderName} (senderId: ${data.senderId})`);
    let targetSocketId = null;
    if (data.senderId) {
      targetSocketId = connectedUsers.get(data.senderId.toLowerCase())?.socketId;
    }
    if (!targetSocketId) {
      targetSocketId = connectedUsers.get(data.senderName.toLowerCase())?.socketId;
    }

    if (targetSocketId) {
      io.to(targetSocketId).emit("friend_request_accepted", {
        receiverId: data.receiverId,
        receiverName: data.receiverName,
        receiverAvatar: data.receiverAvatar,
        receiverFrame: data.receiverFrame,
        receiverLevel: data.receiverLevel
      });
    }
  });

  socket.on("send_dm", (data: { 
    senderName: string; 
    targetId?: string;
    targetName: string; 
    text: string; 
  }) => {
    console.log(`[DM] From ${data.senderName} to ${data.targetName} (${data.targetId}): ${data.text}`);
    let targetSocketId = null;
    if (data.targetId) {
      targetSocketId = connectedUsers.get(data.targetId.toLowerCase())?.socketId;
    }
    if (!targetSocketId) {
      targetSocketId = connectedUsers.get(data.targetName.toLowerCase())?.socketId;
    }

    if (targetSocketId) {
      io.to(targetSocketId).emit("incoming_dm", {
        senderName: data.senderName,
        text: data.text
      });
    }
  });

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

      // Snake & Ladders always uses RED (goes first) / GREEN (goes second).
      // For Ludo classic use random pair assignment.
      // Since server doesn't track mode, always use RED/GREEN — SnakeLadder reads these directly,
      // and Ludo classic UI maps them by position, not name, so this is safe.
      const p1Color = "RED";
      const p2Color = "GREEN";

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
    // Tag this socket as an active gameplay socket for the room
    (socket as any).data = { type: "gameplay", roomCode: data.roomCode };
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
  socket.on("client_action", (data: { roomCode: string; actionType: 'ROLL' | 'MOVE' | 'UNDO' | 'SL_STATE_SYNC' | 'SL_DICE_ROLLING'; nextColor?: string; isGameOver?: boolean; diceValue?: number; tokenId?: string; cost?: number; hasLegalMoves?: boolean }) => {
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

    // Clean up registered user
    for (const [key, value] of connectedUsers.entries()) {
      if (value.socketId === socket.id) {
        connectedUsers.delete(key);
      }
    }

    // Stop active room timers ONLY if the active gameplay socket disconnected
    const socketData = (socket as any).data;
    if (socketData?.type === "gameplay" && socketData?.roomCode) {
      const room = activeRooms.get(socketData.roomCode);
      if (room) {
        if (room.intervalId) clearInterval(room.intervalId);
        activeRooms.delete(socketData.roomCode);
        console.log(`[Authoritative Timer] Cleaned up room ${socketData.roomCode} due to gameplay disconnect`);
      }
    }
  });
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

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => {
  console.log(`Ludo Enterprise Server running on port ${PORT}`);
});

