import { useTournamentStore } from '../store/tournament.store';
import { TournamentService } from '../services/TournamentService';

export const useTournament = () => {
  const tournaments = useTournamentStore((s) => s.tournaments);
  const activeTournamentId = useTournamentStore((s) => s.activeTournamentId);

  const activeTournament = tournaments.find((t) => t.id === activeTournamentId);

  return {
    tournaments,
    activeTournamentId,
    activeTournament,
    selectTournament: TournamentService.selectTournament,
    startTournament: TournamentService.startTournament,
    finishTournament: TournamentService.finishTournament,
  };
};
export default useTournament;
