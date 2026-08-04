import { create } from 'zustand';
import { RoundStructure, BracketMatch } from '../types/bracket.types';
import { INITIAL_16P_BRACKET } from '../constants/bracket.constants';

interface BracketState {
  rounds: RoundStructure[];

  // Actions
  setRounds: (rounds: RoundStructure[]) => void;
  advancePlayer: (matchId: string, winnerId: string, score1: number, score2: number) => void;
  resetBracket: () => void;
}

const STORAGE_BRACKETS_KEY = 'ludo_tournament_brackets_v1';

const getInitialBrackets = (): RoundStructure[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_BRACKETS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return INITIAL_16P_BRACKET;
};

export const useBracketStore = create<BracketState>((set) => ({
  rounds: getInitialBrackets(),

  setRounds: (rounds) => {
    set({ rounds });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_BRACKETS_KEY, JSON.stringify(rounds));
    }
  },

  advancePlayer: (matchId, winnerId, score1, score2) => {
    set((state) => {
      // Find the round and match
      const nextRounds = JSON.parse(JSON.stringify(state.rounds)) as RoundStructure[];
      let targetRoundIdx = -1;
      let targetMatchIdx = -1;

      for (let r = 0; r < nextRounds.length; r++) {
        const mIdx = nextRounds[r].matches.findIndex((m) => m.id === matchId);
        if (mIdx !== -1) {
          targetRoundIdx = r;
          targetMatchIdx = mIdx;
          break;
        }
      }

      if (targetRoundIdx === -1) return {};

      const currentMatch = nextRounds[targetRoundIdx].matches[targetMatchIdx];
      currentMatch.status = 'COMPLETED';
      currentMatch.score1 = score1;
      currentMatch.score2 = score2;
      currentMatch.winnerId = winnerId;

      // Find the winner player profile
      const winnerObj =
        currentMatch.player1?.id === winnerId ? currentMatch.player1 : currentMatch.player2;

      // If there is a next round, advance the player
      const nextRoundIdx = targetRoundIdx + 1;
      if (nextRoundIdx < nextRounds.length) {
        // Map current match slot index to next round matchup slots (every 2 matches flow to 1 match)
        const nextMatchIdx = Math.floor(targetMatchIdx / 2);
        const nextMatch = nextRounds[nextRoundIdx].matches[nextMatchIdx];
        const isPlayer1Position = targetMatchIdx % 2 === 0;

        if (isPlayer1Position) {
          nextMatch.player1 = winnerObj;
        } else {
          nextMatch.player2 = winnerObj;
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_BRACKETS_KEY, JSON.stringify(nextRounds));
      }

      return { rounds: nextRounds };
    });
  },

  resetBracket: () => {
    set({ rounds: INITIAL_16P_BRACKET });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_BRACKETS_KEY, JSON.stringify(INITIAL_16P_BRACKET));
    }
  },
}));
