import { useRegistrationStore } from '../store/registration.store';
import { useTournamentStore } from '../store/tournament.store';
import { useUserStore } from '../../../user/user.store';
import { registerUserForTournamentApi, unregisterUserFromTournamentApi } from '../api';
import { canAffordEntry } from '../utils/validator';

export const RegistrationService = {
  joinTournament: async (tournamentId: string): Promise<boolean> => {
    const { tournaments, registerPlayer } = useTournamentStore.getState();
    const tour = tournaments.find((t) => t.id === tournamentId);
    if (!tour) return false;

    const userStore = useUserStore.getState();
    const user = userStore.user;
    if (!user) return false;

    // Check afford limits
    const userCoins = user.coins;
    const userGems = user.gems;
    if (!canAffordEntry(tour.entryCost, userCoins, userGems)) return false;

    // Call Mock API
    const success = await registerUserForTournamentApi(tournamentId);
    if (success) {
      // Deduct coins or gems
      if (tour.entryCost.coins) {
        userStore.updateUser({ coins: userCoins - tour.entryCost.coins });
      } else if (tour.entryCost.gems) {
        userStore.updateUser({ gems: userGems - tour.entryCost.gems });
      }

      registerPlayer(tournamentId);
      useRegistrationStore.getState().registerUserForTournament(tournamentId);
      return true;
    }
    return false;
  },

  leaveTournament: async (tournamentId: string): Promise<boolean> => {
    const success = await unregisterUserFromTournamentApi(tournamentId);
    if (success) {
      useRegistrationStore.getState().unregisterUser(tournamentId);
      return true;
    }
    return false;
  },
};
export default RegistrationService;
