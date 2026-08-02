import { create } from "zustand";

export interface RoomMember {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  color: "RED" | "GREEN" | "YELLOW" | "BLUE";
  avatar?: string;
  profileFrame?: string;
  nameBanner?: string;
}

export interface RoomState {
  roomCode: string | null;
  mode: string;
  maxPlayers: number;
  members: RoomMember[];
  isGameStarting: boolean;
  createRoom: (
    mode: string,
    maxPlayers: number,
    hostName: string,
    avatar?: string,
    profileFrame?: string,
    nameBanner?: string,
    assignedColor?: "RED" | "GREEN" | "YELLOW" | "BLUE"
  ) => string;
  joinRoom: (
    code: string,
    userName: string,
    avatar?: string,
    profileFrame?: string,
    nameBanner?: string,
    assignedColor?: "RED" | "GREEN" | "YELLOW" | "BLUE"
  ) => boolean;
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
  createRoom: (mode, maxPlayers, hostName, avatar, profileFrame, nameBanner, assignedColor) => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const host: RoomMember = { 
      id: "m_1", 
      name: hostName, 
      isHost: true, 
      isReady: true, 
      color: assignedColor || (Math.random() < 0.5 ? "BLUE" : "RED"),
      avatar,
      profileFrame: profileFrame || "/assets/images/icons/profile_frame_v3.png",
      nameBanner: nameBanner || "/assets/images/icons/name_banner_v2.png"
    };
    set({ roomCode: code, mode, maxPlayers, members: [host], isGameStarting: false });
    return code;
  },
  joinRoom: (code, userName, avatar, profileFrame, nameBanner, assignedColor) => {
    const { members, maxPlayers } = get();
    if (members.length >= maxPlayers) return false;
    
    const hostColor = members[0]?.color || "BLUE";
    let guestColor = assignedColor;
    if (!guestColor) {
      if (hostColor === "BLUE") guestColor = "GREEN";
      else if (hostColor === "GREEN") guestColor = "BLUE";
      else if (hostColor === "RED") guestColor = "YELLOW";
      else guestColor = "RED";
    }

    const member: RoomMember = { 
      id: "m_" + (members.length + 1), 
      name: userName, 
      isHost: false, 
      isReady: false, 
      color: guestColor as "RED" | "GREEN" | "YELLOW" | "BLUE",
      avatar,
      profileFrame: profileFrame || "/assets/images/icons/profile_frame_v3.png",
      nameBanner: nameBanner || "/assets/images/icons/name_banner_v2.png"
    };
    set({ roomCode: code, members: [...members, member] });
    return true;
  },
  leaveRoom: () => set({ roomCode: null, members: [], isGameStarting: false }),
  toggleReady: (memberId) => set((s) => ({
    members: s.members.map((m) => m.id === memberId ? { ...m, isReady: !m.isReady } : m)
  })),
  startGame: () => set({ isGameStarting: true })
}));
