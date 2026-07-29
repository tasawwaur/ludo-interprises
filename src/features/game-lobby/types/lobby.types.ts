export interface LobbyPlayer {
  id: string;
  name: string;
  avatar?: string;
  rank: string;
  isReady: boolean;
  isSpeaking: boolean;
  pingMs: number;
}

export interface RoomDetails {
  code: string;
  mode: string;
  entryFee: number;
  players: LobbyPlayer[];
}
