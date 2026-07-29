import { useBracketStore } from '../store/bracket.store';
import { BracketService } from '../services/BracketService';

export const useBracket = () => {
  const rounds = useBracketStore((s) => s.rounds);

  return {
    rounds,
    completeMatch: BracketService.completeMatch,
    resetTournamentBracket: BracketService.resetTournamentBracket,
  };
};
export default useBracket;
