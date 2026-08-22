// Safe localStorage wrapper to prevent QuotaExceededError and mobile storage crashes

const cleanupStaleStorage = () => {
  if (typeof window === 'undefined') return;
  try {
    // Keys that can be safely cleared to free up space
    const safeToPurgeKeys = [
      'ludo_sl_engine_state',
      'ludo_classic_engine_state',
      'ludo_active_match_session',
      'ludo_room_code',
      'ludo_player_detailed_stats',
      'ludo_analytics_events_v1',
      'ludo_match_history_cache',
      'ludo_temp_logs',
      'ludo_guest_account',
      'ludo_google_account',
      'ludo_facebook_account'
    ];

    for (const key of safeToPurgeKeys) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    }

    // Clean up any dynamic duplicate account keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('ludo_acc_id_') || key.startsWith('ludo_acc_email_') || key.startsWith('ludo_guest_') || key.startsWith('ludo_google_'))) {
        try {
          localStorage.removeItem(key);
        } catch (e) {}
      }
    }
  } catch (e) {
    console.warn('Storage cleanup warning:', e);
  }
};

export const safeStorage = {
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`safeStorage.get error for ${key}:`, e);
      return null;
    }
  },

  set: (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e: any) {
      // If QuotaExceededError occurs on mobile, attempt purge and retry
      if (e?.name === 'QuotaExceededError' || e?.code === 22 || e?.code === 1014 || (e?.message && e.message.includes('quota'))) {
        console.warn(`QuotaExceededError on setting ${key}. Cleaning stale cache...`);
        cleanupStaleStorage();
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (retryError) {
          console.warn(`Storage quota still exceeded for ${key}. Skipping non-critical persistence.`);
          return false;
        }
      }
      console.warn(`safeStorage.set error for ${key}:`, e);
      return false;
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  },

  cleanup: cleanupStaleStorage
};

export const storage = safeStorage;
