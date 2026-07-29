import { create } from 'zustand';
import { TournamentItem } from '../types/tournament.types';
import { INITIAL_TOURNAMENTS } from '../constants/tournament.constants';

interface TournamentState {
  tournaments: TournamentItem[];
  activeTournamentId: string | null;

  // Actions
  selectTournament: (id: string) => void;
  registerPlayer: (id: string) => boolean;
  updateTournamentStatus: (id: string, status: TournamentItem['status']) => void;
}

const STORAGE_TOURNAMENTS_KEY = 'ludo_tournaments_list_v1';
const STORAGE_ACTIVE_TOUR_ID = 'ludo_active_tour_id_v1';

const getInitialTournaments = (): TournamentItem[] => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_TOURNAMENTS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return INITIAL_TOURNAMENTS;
};

const getInitialActiveId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_ACTIVE_TOUR_ID);
  }
  return null;
};

export const useTournamentStore = create<TournamentState>((set, get) => ({
  tournaments: getInitialTournaments(),
  activeTournamentId: getInitialActiveId(),

  selectTournament: (id) => {
    set({ activeTournamentId: id });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_ACTIVE_TOUR_ID, id);
    }
  },

  registerPlayer: (id) => {
    const { tournaments } = get();
    const tourIndex = tournaments.findIndex((t) => t.id === id);
    if (tourIndex === -1) return false;

    const tour = tournaments[tourIndex];
    if (tour.registeredCount >= tour.maxParticipants) return false;

    const updatedTour = {
      ...tour,
      registeredCount: tour.registeredCount + 1,
    };

    const nextTournaments = [...tournaments];
    nextTournaments[tourIndex] = updatedTour;

    set({ tournaments: nextTournaments });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_TOURNAMENTS_KEY, JSON.stringify(nextTournaments));
    }
    return true;
  },

  updateTournamentStatus: (id, status) => {
    set((state) => {
      const nextTours = state.tournaments.map((t) =>
        t.id === id ? { ...t, status } : t
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_TOURNAMENTS_KEY, JSON.stringify(nextTours));
      }
      return { tournaments: nextTours };
    });
  },
}));
