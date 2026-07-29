import { create } from 'zustand';

interface RegistrationState {
  registeredTournamentIds: string[];

  // Actions
  registerUserForTournament: (tournamentId: string) => void;
  unregisterUser: (tournamentId: string) => void;
  isRegistered: (tournamentId: string) => boolean;
}

const STORAGE_USER_TOURNAMENTS = 'ludo_registered_tournaments_v1';

const getInitialRegistrations = (): string[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_USER_TOURNAMENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return [];
};

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  registeredTournamentIds: getInitialRegistrations(),

  registerUserForTournament: (tournamentId) => {
    set((state) => {
      const nextIds = [...new Set([...state.registeredTournamentIds, tournamentId])];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_USER_TOURNAMENTS, JSON.stringify(nextIds));
      }
      return { registeredTournamentIds: nextIds };
    });
  },

  unregisterUser: (tournamentId) => {
    set((state) => {
      const nextIds = state.registeredTournamentIds.filter((id) => id !== tournamentId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_USER_TOURNAMENTS, JSON.stringify(nextIds));
      }
      return { registeredTournamentIds: nextIds };
    });
  },

  isRegistered: (tournamentId) => {
    return get().registeredTournamentIds.includes(tournamentId);
  },
}));
