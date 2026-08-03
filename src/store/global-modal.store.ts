import { create } from 'zustand';
import { PlayerDetailedStats } from './player-stats.store';
import { useUserStore } from '../user/user.store';
import { usePlayerStatsStore } from './player-stats.store';
import { GLOBAL_PLAYER_DATABASE } from './player-database.store';

interface GlobalModalState {
  activeProfilePlayerId: string | null;
  openProfile: (idOrUsername: string) => void;
  closeProfile: () => void;
}

export const useGlobalModalStore = create<GlobalModalState>((set) => ({
  activeProfilePlayerId: null,
  openProfile: (idOrUsername) => set({ activeProfilePlayerId: idOrUsername }),
  closeProfile: () => set({ activeProfilePlayerId: null })
}));

export const getPlayerProfile = (idOrUsername: string) => {
  const localUser = useUserStore.getState().user;
  const localStats = usePlayerStatsStore.getState().stats;
  
  if (!idOrUsername) return null;
  const query = idOrUsername.trim().toLowerCase();

  // If local user (match check by ID or username)
  if (
    localUser &&
    (query === localUser.id.toLowerCase() || 
     query === (localUser.uid || '').toLowerCase() ||
     query === localStats.playerId.toLowerCase() || 
     query === (localUser.displayName || localUser.username || "tasavvur").toLowerCase())
  ) {
    return {
      id: localStats.playerId,
      name: localUser.displayName || localUser.username || localStats.username,
      avatarUrl: localUser.avatar || localStats.avatarUrl,
      equippedFrame: localUser.equippedFrame || localStats.equippedFrame,
      level: localUser.level || localStats.level,
      country: localStats.country,
      countryFlag: localStats.countryFlag,
      totalEarning: localStats.totalEarning,
      currentGold: localUser.coins,
      currentLeague: localStats.currentLeague,
      gamesWon: localStats.matchesWon,
      gamesPlayed: localStats.matchesPlayed,
      teamWins: localStats.teamWins,
      winStreak: localStats.currentWinStreak,
      twoPlayerWins: localStats.twoPlayerWins,
      titanBadgeCount: localStats.titanBadgeCount,
      fourPlayerWins: localStats.fourPlayerWins,
      killCount: localStats.killCount
    };
  }

  // Find in global 100-player database
  const found = GLOBAL_PLAYER_DATABASE.find(
    p => p.playerId.toLowerCase() === query || p.username.toLowerCase() === query
  );

  if (found) {
    return {
      id: found.playerId,
      name: found.username,
      avatarUrl: found.avatarUrl,
      equippedFrame: found.equippedFrame,
      level: found.level,
      country: found.country,
      countryFlag: found.countryFlag,
      totalEarning: found.totalEarning,
      currentGold: found.currentCoins,
      currentLeague: found.currentLeague,
      gamesWon: found.matchesWon,
      gamesPlayed: found.matchesPlayed,
      teamWins: found.teamWins,
      winStreak: found.currentWinStreak,
      twoPlayerWins: found.twoPlayerWins,
      titanBadgeCount: found.titanBadgeCount,
      fourPlayerWins: found.fourPlayerWins,
      killCount: found.killCount
    };
  }

  // Last-resort fallback mock if name is not in database
  return {
    id: `PVZV${1000 + Math.floor(Math.abs(hashString(idOrUsername)) % 9000)}`,
    name: idOrUsername,
    avatarUrl: "",
    equippedFrame: "frame_default",
    level: 5,
    country: "INDIA",
    countryFlag: "🇮🇳",
    totalEarning: "10 K",
    currentGold: 20000,
    currentLeague: "Bronze",
    gamesWon: 12,
    gamesPlayed: 25,
    teamWins: 2,
    winStreak: 1,
    twoPlayerWins: 6,
    titanBadgeCount: 0,
    fourPlayerWins: 4,
    killCount: 22
  };
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}
