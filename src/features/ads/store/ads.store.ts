import { create } from 'zustand';
import { AdConfig, AdStatus, AdState } from '../types/ads.types';
import { INITIAL_AD_CONFIGS } from '../constants/ad.constants';
import { PlacementId } from '../types/placement.types';

interface AdsState {
  configs: AdConfig[];
  adStatusMap: Record<string, AdStatus>;
  testModeEnabled: boolean;

  // Actions
  updateAdState: (id: string, state: AdState, error?: string) => void;
  toggleTestMode: () => void;
  recordImpression: (placementId: PlacementId) => void;
}

const STORAGE_ADS_TEST_MODE = 'ludo_ads_test_mode_v1';

const getInitialTestMode = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_ADS_TEST_MODE) !== 'false';
  }
  return true;
};

const getInitialAdStatuses = (): Record<string, AdStatus> => {
  const statuses: Record<string, AdStatus> = {};
  INITIAL_AD_CONFIGS.forEach((cfg) => {
    statuses[cfg.id] = {
      config: cfg,
      state: 'IDLE',
    };
  });
  return statuses;
};

export const useAdsStore = create<AdsState>((set) => ({
  configs: INITIAL_AD_CONFIGS,
  adStatusMap: getInitialAdStatuses(),
  testModeEnabled: getInitialTestMode(),

  updateAdState: (id, state, error) => {
    set((stateObj) => {
      const target = stateObj.adStatusMap[id];
      if (!target) return {};

      const nextStatusMap = {
        ...stateObj.adStatusMap,
        [id]: {
          ...target,
          state,
          error,
          lastLoadedTime: state === 'LOADED' ? new Date().toISOString() : target.lastLoadedTime,
        },
      };
      return { adStatusMap: nextStatusMap };
    });
  },

  toggleTestMode: () => {
    set((state) => {
      const nextVal = !state.testModeEnabled;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_ADS_TEST_MODE, String(nextVal));
      }
      return { testModeEnabled: nextVal };
    });
  },

  recordImpression: (placementId) => {
    // Analytics telemetry
    console.log(`[Ad Impression] Placement shown: ${placementId}`);
  },
}));
