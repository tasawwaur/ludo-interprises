import { create } from 'zustand';

export interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  email: string;
  avatar?: string; // Base64 Data URL or Image URL
  country?: string;
  rank: number;
  coins: number;
  gems: number;
  level?: number;
  xp?: number;
  nextLevelXp?: number;
}

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  logout: () => void;
}

const STORAGE_KEY = 'ludo_user_profile_v1';

const getInitialProfile = (): UserProfile => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load profile from localStorage:', e);
    }
  }

  return {
    id: 'usr_guest4296',
    username: 'Guest4296',
    displayName: 'Ludo King',
    email: 'guest@ludostar.com',
    avatar: undefined,
    country: '🇮🇳',
    rank: 1,
    coins: 1000,
    gems: 30,
    level: 2,
    xp: 450,
    nextLevelXp: 1000,
  };
};

export const useUserStore = create<UserState>((set) => ({
  user: getInitialProfile(),
  isAuthenticated: true,

  setUser: (user) => {
    if (user && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } catch (e) {
        console.warn('Failed to save user to localStorage:', e);
      }
    }
    set({ user, isAuthenticated: !!user });
  },

  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...updates };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to persist user updates:', e);
        }
      }
      return { user: updated };
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ user: null, isAuthenticated: false });
  },
}));
