import { useBracketStore } from '../store/bracket.store';
import { submitMatchResultApi } from '../api/match.api';

export const BracketService = {
  completeMatch: async (
    matchId: string,
    winnerId: string,
    score1: number,
    score2: number
  ): Promise<boolean> => {
    const success = await submitMatchResultApi({ matchId, score1, score2, winnerId });
    if (success) {
      useBracketStore.getState().advancePlayer(matchId, winnerId, score1, score2);
      return true;
    }
    return false;
  },

  resetTournamentBracket: () => {
    useBracketStore.getState().resetBracket();
  },
};
export default BracketService;
