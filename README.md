# 🏆 Enterprise Ludo Platform Architecture (AAA Level)

A high-performance, enterprise-grade Ludo multiplayer platform built with **React 19 + TypeScript**, **Vite**, **HTML5 Canvas Engine**, **Socket.IO**, and **Express Backend**.

## 🚀 Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development frontend server:
   ```bash
   npm run dev
   ```

3. Run multiplayer WebSocket backend server:
   ```bash
   npm run server
   ```

## 📁 Directory Structure
- `src/app`: Core App setup and layout.
- `src/components`: UI Design system and reusable modular components.
- `src/pages`: Screens (Splash, Home, Match, Store, Tournament, Profile).
- `src/game`: Canvas Board Game Engine, Physics, Rules, Sound Synthesizer.
- `src/multiplayer`: Socket.IO client, Matchmaking, Voice Chat, Room Sync.
- `src/ai`: Neural Bot decision and path search engine.
- `server/`: Express + Socket.IO Node.js Backend Server.
