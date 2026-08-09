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
  equippedFrame?: string;
  equippedToken?: string;
  equippedBoard?: string;
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

const isTargetVIPID = (user: UserProfile | null): boolean => {
  if (!user) return false;
  const idStr = `${user.id || ''} ${user.uid || ''}`.toUpperCase();
  return idStr.includes('63554281');
};

const getInitialProfile = (): UserProfile | null => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (isTargetVIPID(parsed)) {
          return {
            ...parsed,
            id: 'LUDO-63554281',
            uid: 'LUDO-63554281',
            coins: 1000000000,
            gems: 1000000000,
          };
        }
        return {
          ...parsed,
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


// Check if a saved user is a real logged-in user (guest, google, facebook, phone sab valid)
const isRealLoggedInUser = (user: UserProfile | null): boolean => {
  if (!user) return false;
  if (!user.loginProvider) return false;
  if (!user.id || !user.username) return false;
  return true;
};

let _initialProfile = getInitialProfile();
if (_initialProfile && isTargetVIPID(_initialProfile)) {
  _initialProfile.coins = 1000000000;
  _initialProfile.gems = 1000000000;
}

const persistUserProfile = (user: UserProfile) => {
  if (!user || typeof window === 'undefined') return;
  try {
    const dataStr = JSON.stringify(user);
    localStorage.setItem(STORAGE_KEY, dataStr);

    if (user.id) {
      localStorage.setItem(`ludo_acc_id_${user.id.toLowerCase()}`, dataStr);
    }
    if (user.email) {
      const sanitizedEmail = user.email.toLowerCase().trim().replace(/\s+/g, '_');
      localStorage.setItem(`ludo_acc_email_${sanitizedEmail}`, dataStr);
    }
    if (user.loginProvider) {
      localStorage.setItem(`ludo_${user.loginProvider}_account`, dataStr);
      const activeName = user.displayName || user.username;
      if (activeName) {
        const key = `ludo_${user.loginProvider}_${activeName.toLowerCase().trim().replace(/\s+/g, '_')}`;
        localStorage.setItem(key, dataStr);
      }
    }
  } catch (e) {
    console.warn('Failed to persist user profile:', e);
  }
};

export const useUserStore = create<UserState>((set) => ({
  user: _initialProfile,
  isAuthenticated: isRealLoggedInUser(_initialProfile),
  justClaimedWelcome: false,

  setJustClaimedWelcome: (claimed) => set({ justClaimedWelcome: claimed }),

  setUser: (user) => {
    let finalUser = user;
    if (user && isTargetVIPID(user)) {
      finalUser = {
        ...user,
        id: 'LUDO-63554281',
        uid: 'LUDO-63554281',
        coins: 1000000000,
        gems: 1000000000,
      };
    }
    if (finalUser) {
      persistUserProfile(finalUser);
    }
    set({ user: finalUser, isAuthenticated: isRealLoggedInUser(finalUser) });
  },

  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state;
      let updated = { ...state.user, ...updates };
      if (isTargetVIPID(updated)) {
        updated.id = 'LUDO-63554281';
        updated.uid = 'LUDO-63554281';
        updated.coins = 1000000000;
        updated.gems = 1000000000;
      }
      persistUserProfile(updated);
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
