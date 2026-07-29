import { create } from "zustand";

export interface RoomMember {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  color: "RED" | "GREEN" | "YELLOW" | "BLUE";
}

export interface RoomState {
  roomCode: string | null;
  mode: string;
  maxPlayers: number;
  members: RoomMember[];
  isGameStarting: boolean;
  createRoom: (mode: string, maxPlayers: number, hostName: string) => string;
  joinRoom: (code: string, userName: string) => boolean;
  leaveRoom: () => void;
  toggleReady: (memberId: string) => void;
  startGame: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  roomCode: null,
  mode: "2P Classic",
  maxPlayers: 2,
  members: [],
  isGameStarting: false,
  createRoom: (mode, maxPlayers, hostName) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const host: RoomMember = { id: "m_1", name: hostName, isHost: true, isReady: true, color: "RED" };
    set({ roomCode: code, mode, maxPlayers, members: [host], isGameStarting: false });
    return code;
  },
  joinRoom: (code, userName) => {
    const { members, maxPlayers } = get();
    if (members.length >= maxPlayers) return false;
    const colors: Array<"RED" | "GREEN" | "YELLOW" | "BLUE"> = ["GREEN", "YELLOW", "BLUE"];
    const member: RoomMember = { id: "m_" + (members.length + 1), name: userName, isHost: false, isReady: false, color: colors[members.length - 1] || "GREEN" };
    set({ roomCode: code, members: [...members, member] });
    return true;
  },
  leaveRoom: () => set({ roomCode: null, members: [], isGameStarting: false }),
  toggleReady: (memberId) => set((s) => ({
    members: s.members.map((m) => m.id === memberId ? { ...m, isReady: !m.isReady } : m)
  })),
  startGame: () => set({ isGameStarting: true })
}));
