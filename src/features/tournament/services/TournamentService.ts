import { useTournamentStore } from '../store/tournament.store';

export const TournamentService = {
  getTournamentById: (id: string) => {
    const { tournaments } = useTournamentStore.getState();
    return tournaments.find((t) => t.id === id);
  },

  selectTournament: (id: string) => {
    useTournamentStore.getState().selectTournament(id);
  },

  startTournament: (id: string) => {
    useTournamentStore.getState().updateTournamentStatus(id, 'RUNNING');
  },

  finishTournament: (id: string) => {
    useTournamentStore.getState().updateTournamentStatus(id, 'FINISHED');
  },
};
export default TournamentService;
