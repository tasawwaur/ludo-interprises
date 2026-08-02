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
  loginProvider?: 'guest' | 'google' | 'facebook' | 'phone';
  facebookId?: string;
  googleId?: string;
  age?: number;
  is18Plus?: boolean;
  gender?: 'male' | 'female' | 'other';
  syncedFBFriends?: Array<{ id: string; name: string; avatarUrl?: string; isOnline: boolean }>;
  crowns?: number;
  uid?: string;
}

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  justClaimedWelcome: boolean;
  setJustClaimedWelcome: (claimed: boolean) => void;
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  logout: () => void;
}

const STORAGE_KEY = 'ludo_user_profile_v8';

const getInitialProfile = (): UserProfile | null => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          // Restore exact saved values — only fallback if truly undefined/missing
          coins: parsed.coins !== undefined ? parsed.coins : 20000,
          gems: parsed.gems !== undefined ? parsed.gems : 200,
          crowns: parsed.crowns !== undefined ? parsed.crowns : 10,
        };
      }
    } catch (e) {
      console.warn('Failed to load profile from localStorage:', e);
    }
  }
  return null; // No saved session — user must login
};


// Check if a saved user is a real logged-in user (not just the default guest)
const isRealLoggedInUser = (user: UserProfile | null): boolean => {
  if (!user) return false;
  // Default guest profile ID se identify karo
  if (user.id === 'usr_guest4296') return false;
  // loginProvider hona chahiye (fb, google, phone)
  return !!user.loginProvider;
};

const _initialProfile = getInitialProfile();

export const useUserStore = create<UserState>((set) => ({
  user: _initialProfile,
  isAuthenticated: isRealLoggedInUser(_initialProfile),
  justClaimedWelcome: false,

  setJustClaimedWelcome: (claimed) => set({ justClaimedWelcome: claimed }),

  setUser: (user) => {
    if (user && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        if (user.loginProvider) {
          localStorage.setItem(`ludo_${user.loginProvider}_account`, JSON.stringify(user));
          const activeName = user.displayName || user.username;
          if (activeName) {
            const key = `ludo_${user.loginProvider}_${activeName.toLowerCase().trim().replace(/\s+/g, '_')}`;
            localStorage.setItem(key, JSON.stringify(user));
          }
        }
      } catch (e) {
        console.warn('Failed to save user to localStorage:', e);
      }
    }
    set({ user, isAuthenticated: isRealLoggedInUser(user) });
  },

  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...updates };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          if (updated.loginProvider) {
            localStorage.setItem(`ludo_${updated.loginProvider}_account`, JSON.stringify(updated));
            const activeName = updated.displayName || updated.username;
            if (activeName) {
              const key = `ludo_${updated.loginProvider}_${activeName.toLowerCase().trim().replace(/\s+/g, '_')}`;
              localStorage.setItem(key, JSON.stringify(updated));
            }
          }
        } catch (e) {
          console.warn('Failed to persist user updates:', e);
        }
      }
      return { user: updated };
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.warn('Failed to clear active session on logout:', e);
      }
    }
    set({ user: null, isAuthenticated: false });
  },
}));
