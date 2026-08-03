import { create } from 'zustand';
import { useUserStore } from '../user/user.store';

export interface CompletedMatchData {
  gameMode: "1VS1" | "2VS2" | "4PLAYER" | "PRIVATE" | "TOURNAMENT";
  isWin: boolean;
  betCoins: number;
  betDiamonds?: number;
  tokensMoved: number;
  kills: number;
  hardKills: number;
  revengeKills: number;
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  tokensCompleted: number;
  tokensLost: number;
  diceRolls: number;
  sixesCount: number;
  maxConsecutiveSixes: number;
  safeZoneVisits: number;
  luckyRolls: number;
  unluckyRolls: number;
  isFirstKill: boolean;
  isPerfectWin: boolean;
  isAllTokensHome: boolean;
  matchDurationSeconds: number;
}

export interface PlayerDetailedStats {
  playerId: string;
  username: string;
  avatarUrl?: string;
  equippedFrame?: string;
  country: string;
  countryFlag: string;
  
  // XP & Level
  xp: number;
  level: number;
  nextLevelXp: number;
  
  // Economy
  currentCoins: number;
  currentDiamonds: number;
  totalCoinsEarned: number;
  totalDiamondsEarned: number;
  totalRewardsClaimed: number;
  dailyLoginStreak: number;
  
  // Match Stats
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  drawMatches: number;
  currentWinStreak: number;
  highestWinStreak: number;
  totalMatchDurationSeconds: number;

  // Game Modes Stats
  modeStats: {
    "1VS1": { played: number; wins: number; losses: number };
    "2VS2": { played: number; wins: number; losses: number };
    "4PLAYER": { played: number; wins: number; losses: number };
    "PRIVATE": { played: number; wins: number };
    "TOURNAMENT": { played: number; wins: number };
  };

  // Detailed Gameplay Stats
  killCount: number;
  hardKillCount: number;
  revengeKillCount: number;
  doubleKill: number;
  tripleKill: number;
  quadraKill: number;
  tokensCompleted: number;
  tokensLost: number;
  totalDiceRolls: number;
  totalSixes: number;
  consecutiveSixes: number;
  safeZoneVisits: number;
  luckyRolls: number;
  unluckyRolls: number;

  totalEarning: string;
  teamWins: number;
  twoPlayerWins: number;
  fourPlayerWins: number;
  titanBadgeCount: number;

  // Achievements Unlocked List
  achievements: string[];
  currentLeague: string;
  signature: string;
  createdDate: string;
  lastLogin: string;
}

interface PlayerStatsState {
  stats: PlayerDetailedStats;
  recordMatchEnd: (matchData: CompletedMatchData) => void;
  syncWithUserStore: () => void;
  updateStats: (updates: Partial<PlayerDetailedStats>) => void;
  resetStats: () => void;
}

const STORAGE_KEY_STATS = 'ludo_player_detailed_stats_v2';

const calculateNextLevelXp = (level: number) => {
  return level * 150 + 100;
};

const getInitialDetailedStats = (username: string = "TASAVVUR"): PlayerDetailedStats => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STATS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load stats:', e);
    }
  }

  // Base default stats for a fresh player
  return {
    playerId: "PVHB4472",
    username: username,
    avatarUrl: "",
    equippedFrame: "frame_default",
    country: "INDIA",
    countryFlag: "🇮🇳",
    xp: 0,
    level: 1,
    nextLevelXp: calculateNextLevelXp(1),
    currentCoins: 20000,
    currentDiamonds: 200,
    totalCoinsEarned: 20000,
    totalDiamondsEarned: 200,
    totalRewardsClaimed: 5,
    dailyLoginStreak: 1,
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    drawMatches: 0,
    currentWinStreak: 0,
    highestWinStreak: 0,
    totalMatchDurationSeconds: 0,
    modeStats: {
      "1VS1": { played: 0, wins: 0, losses: 0 },
      "2VS2": { played: 0, wins: 0, losses: 0 },
      "4PLAYER": { played: 0, wins: 0, losses: 0 },
      "PRIVATE": { played: 0, wins: 0 },
      "TOURNAMENT": { played: 0, wins: 0 }
    },
    killCount: 0,
    hardKillCount: 0,
    revengeKillCount: 0,
    doubleKill: 0,
    tripleKill: 0,
    quadraKill: 0,
    tokensCompleted: 0,
    tokensLost: 0,
    totalDiceRolls: 0,
    totalSixes: 0,
    consecutiveSixes: 0,
    safeZoneVisits: 0,
    luckyRolls: 0,
    unluckyRolls: 0,
    totalEarning: "20.0 K",
    teamWins: 0,
    twoPlayerWins: 0,
    fourPlayerWins: 0,
    titanBadgeCount: 0,
    achievements: [],
    currentLeague: "Bronze",
    signature: "ROOKIE - I",
    createdDate: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
};

export const usePlayerStatsStore = create<PlayerStatsState>((set, get) => {
  const initialUsername = useUserStore.getState().user?.displayName || useUserStore.getState().user?.username || "TASAVVUR";
  
  return {
    stats: getInitialDetailedStats(initialUsername),

    syncWithUserStore: () => {
      const user = useUserStore.getState().user;
      if (!user) return;
      
      set((state) => {
        const updated = {
          ...state.stats,
          playerId: user.uid || user.id || state.stats.playerId,
          username: user.displayName || user.username || state.stats.username,
          avatarUrl: user.avatar || state.stats.avatarUrl,
          equippedFrame: user.equippedFrame || state.stats.equippedFrame,
          currentCoins: user.coins !== undefined ? user.coins : state.stats.currentCoins,
          currentDiamonds: user.gems !== undefined ? user.gems : state.stats.currentDiamonds,
          level: user.level !== undefined ? user.level : state.stats.level,
        };
        
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(updated));
        }
        return { stats: updated };
      });
    },

    updateStats: (updates) => {
      set((state) => {
        const updated = {
          ...state.stats,
          ...updates
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(updated));
        }
        return { stats: updated };
      });
    },

    recordMatchEnd: (matchData: CompletedMatchData) => {
      set((state) => {
        const prev = state.stats;
        
        // 1. Validate Match & calculate coin rewards
        const coinDelta = matchData.isWin ? matchData.betCoins : -matchData.betCoins;
        const finalCoins = Math.max(0, prev.currentCoins + coinDelta);
        const finalCoinsEarned = prev.totalCoinsEarned + (matchData.isWin ? matchData.betCoins : 0);
        
        const diamondDelta = matchData.isWin ? (matchData.betDiamonds || 5) : 0;
        const finalDiamonds = prev.currentDiamonds + diamondDelta;
        const finalDiamondsEarned = prev.totalDiamondsEarned + diamondDelta;

        // 2. Calculate XP Earned based on prompt rules
        let matchXp = 0;
        matchXp += matchData.isWin ? 200 : 0; // Win Match
        matchXp += matchData.kills * 8; // Kill Enemy Token (+8 XP each)
        matchXp += matchData.hardKills * 50; // Hard Kill
        matchXp += matchData.tokensCompleted * 50; // Complete One Token
        matchXp += matchData.isFirstKill ? 20 : 0; // First Kill Bonus
        matchXp += matchData.isPerfectWin ? 75 : 0; // Perfect Win Bonus
        matchXp += matchData.isAllTokensHome ? 100 : 0; // All Tokens Home Bonus

        let finalXp = prev.xp + matchXp;
        let finalLevel = prev.level;
        let nextLvlXp = prev.nextLevelXp;

        // Level Up calculation (supports multiple level ups in one match)
        while (finalXp >= nextLvlXp && finalLevel < 200) {
          finalXp -= nextLvlXp;
          finalLevel += 1;
          nextLvlXp = calculateNextLevelXp(finalLevel);
        }

        // 3. Update Win / Loss Statistics
        const finalWins = prev.matchesWon + (matchData.isWin ? 1 : 0);
        const finalLosses = prev.matchesLost + (matchData.isWin ? 0 : 1);
        const finalPlayed = prev.matchesPlayed + 1;
        
        const finalStreak = matchData.isWin ? prev.currentWinStreak + 1 : 0;
        const finalHighestStreak = Math.max(prev.highestWinStreak, finalStreak);

        // 4. Update Game Mode Stats
        const mode = matchData.gameMode;
        const updatedModes = { ...prev.modeStats };
        if (mode === "1VS1" || mode === "2VS2" || mode === "4PLAYER") {
          const m = updatedModes[mode];
          updatedModes[mode] = {
            played: m.played + 1,
            wins: m.wins + (matchData.isWin ? 1 : 0),
            losses: m.losses + (matchData.isWin ? 0 : 1),
          };
        } else if (mode === "PRIVATE") {
          updatedModes.PRIVATE = {
            played: updatedModes.PRIVATE.played + 1,
            wins: updatedModes.PRIVATE.wins + (matchData.isWin ? 1 : 0),
          };
        } else if (mode === "TOURNAMENT") {
          updatedModes.TOURNAMENT = {
            played: updatedModes.TOURNAMENT.played + 1,
            wins: updatedModes.TOURNAMENT.wins + (matchData.isWin ? 1 : 0),
          };
        }

        // 5. Update Gameplay Detailed Statistics
        const finalKillCount = prev.killCount + matchData.kills;
        const finalHardKillCount = prev.hardKillCount + matchData.hardKills;
        const finalRevengeKillCount = prev.revengeKillCount + matchData.revengeKills;
        const finalDoubleKill = prev.doubleKill + matchData.doubleKills;
        const finalTripleKill = prev.tripleKill + matchData.tripleKills;
        const finalQuadraKill = prev.quadraKill + matchData.quadraKills;
        const finalTokensCompleted = prev.tokensCompleted + matchData.tokensCompleted;
        const finalTokensLost = prev.tokensLost + matchData.tokensLost;
        const finalDiceRolls = prev.totalDiceRolls + matchData.diceRolls;
        const finalSixes = prev.totalSixes + matchData.sixesCount;
        const finalConsecutiveSixes = Math.max(prev.consecutiveSixes, matchData.maxConsecutiveSixes);
        const finalSafeZones = prev.safeZoneVisits + matchData.safeZoneVisits;
        const finalLucky = prev.luckyRolls + matchData.luckyRolls;
        const finalUnlucky = prev.unluckyRolls + matchData.unluckyRolls;

        // 6. Update Rank / Signature Title based on Level
        let signature = "ROOKIE - I";
        if (finalLevel >= 180) signature = "EMPEROR - III";
        else if (finalLevel >= 150) signature = "EMPEROR - II";
        else if (finalLevel >= 120) signature = "EMPEROR - I";
        else if (finalLevel >= 90) signature = "KING - III";
        else if (finalLevel >= 70) signature = "KING - I";
        else if (finalLevel >= 50) signature = "WARRIOR - III";
        else if (finalLevel >= 30) signature = "WARRIOR - I";

        // 7. Calculate League Tiers based on win points:
        // Points = wins * 12 - losses * 6
        const points = Math.max(0, finalWins * 12 - finalLosses * 6);
        let league = "Bronze";
        if (points >= 25000) league = "Immortal";
        else if (points >= 16000) league = "Titan";
        else if (points >= 11000) league = "Legend";
        else if (points >= 7000) league = "Emperor";
        else if (points >= 4000) league = "Grand Master";
        else if (points >= 2000) league = "Master";
        else if (points >= 1000) league = "Diamond";
        else if (points >= 500) league = "Platinum";
        else if (points >= 250) league = "Gold";
        else if (points >= 100) league = "Silver";

        // 8. Calculate Achievements list
        const activeAchievements: string[] = [];
        if (finalWins >= 1) activeAchievements.push("First Win");
        if (finalWins >= 100) activeAchievements.push("100 Wins");
        if (finalWins >= 500) activeAchievements.push("500 Wins");
        if (finalWins >= 1000) activeAchievements.push("1000 Wins");
        if (finalWins >= 5000) activeAchievements.push("5000 Wins");
        if (finalWins >= 10000) activeAchievements.push("10000 Wins");
        
        if (finalKillCount >= 1) activeAchievements.push("First Kill");
        if (finalKillCount >= 100) activeAchievements.push("100 Kills");
        if (finalKillCount >= 1000) activeAchievements.push("1000 Kills");
        if (finalKillCount >= 5000) activeAchievements.push("Legend Killer");
        
        if (finalHighestStreak >= 10) activeAchievements.push("Champion");
        if (finalLevel >= 100) activeAchievements.push("Emperor");
        if (finalLevel >= 150) activeAchievements.push("Titan");
        const totalEarning = finalCoinsEarned > 1000000000 
          ? `${(finalCoinsEarned / 1000000000).toFixed(1)} B`
          : finalCoinsEarned > 1000000 
            ? `${(finalCoinsEarned / 1000000).toFixed(1)} M` 
            : finalCoinsEarned > 1000 
              ? `${(finalCoinsEarned / 1000).toFixed(1)} K`
              : `${finalCoinsEarned}`;

        const teamWins = prev.teamWins + (mode === "2VS2" && matchData.isWin ? 1 : 0);
        const twoPlayerWins = prev.twoPlayerWins + (mode === "1VS1" && matchData.isWin ? 1 : 0);
        const fourPlayerWins = prev.fourPlayerWins + (mode === "4PLAYER" && matchData.isWin ? 1 : 0);
        const titanBadgeCount = Math.floor(finalLevel / 4);

        const updatedStats: PlayerDetailedStats = {
          ...prev,
          xp: finalXp,
          level: finalLevel,
          nextLevelXp: nextLvlXp,
          currentCoins: finalCoins,
          currentDiamonds: finalDiamonds,
          totalCoinsEarned: finalCoinsEarned,
          totalDiamondsEarned: finalDiamondsEarned,
          matchesPlayed: finalPlayed,
          matchesWon: finalWins,
          matchesLost: finalLosses,
          currentWinStreak: finalStreak,
          highestWinStreak: finalHighestStreak,
          totalMatchDurationSeconds: prev.totalMatchDurationSeconds + matchData.matchDurationSeconds,
          modeStats: updatedModes,
          killCount: finalKillCount,
          hardKillCount: finalHardKillCount,
          revengeKillCount: finalRevengeKillCount,
          doubleKill: finalDoubleKill,
          tripleKill: finalTripleKill,
          quadraKill: finalQuadraKill,
          tokensCompleted: finalTokensCompleted,
          tokensLost: finalTokensLost,
          totalDiceRolls: finalDiceRolls,
          totalSixes: finalSixes,
          consecutiveSixes: finalConsecutiveSixes,
          safeZoneVisits: finalSafeZones,
          luckyRolls: finalLucky,
          unluckyRolls: finalUnlucky,
          totalEarning,
          teamWins,
          twoPlayerWins,
          fourPlayerWins,
          titanBadgeCount,
          currentLeague: league,
          signature: signature,
          achievements: activeAchievements,
          lastLogin: new Date().toISOString()
        };

        // 9. Save Player Data to permanent database (localStorage)
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(updatedStats));
        }

        // 10. Sync with main UserStore immediately
        const userStore = useUserStore.getState();
        if (userStore.user) {
          userStore.updateUser({
            coins: finalCoins,
            gems: finalDiamonds,
            level: finalLevel,
            nextLevelXp: nextLvlXp,
            xp: finalXp
          });
        }

        return { stats: updatedStats };
      });
    },

    resetStats: () => {
      const fresh = getInitialDetailedStats(useUserStore.getState().user?.displayName || "TASAVVUR");
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(fresh));
      }
      set({ stats: fresh });
    }
  };
});
