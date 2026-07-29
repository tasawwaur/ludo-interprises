import { create } from 'zustand';

interface AdsSettingsState {
  personalizedAdsEnabled: boolean;
  gdprConsentGiven: boolean;
  ccpaConsentGiven: boolean;

  // Actions
  setPersonalizedAds: (enabled: boolean) => void;
  updateConsent: (gdpr: boolean, ccpa: boolean) => void;
}

const STORAGE_PERSONALIZED_ADS = 'ludo_ads_personalized_v1';
const STORAGE_CONSENT = 'ludo_ads_consent_v1';

const getInitialPersonalized = (): boolean => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_PERSONALIZED_ADS) !== 'false';
  }
  return true;
};

const getInitialConsent = (): { gdpr: boolean; ccpa: boolean } => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_CONSENT);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return { gdpr: false, ccpa: false };
};

export const useSettingsStore = create<AdsSettingsState>((set) => ({
  personalizedAdsEnabled: getInitialPersonalized(),
  gdprConsentGiven: getInitialConsent().gdpr,
  ccpaConsentGiven: getInitialConsent().ccpa,

  setPersonalizedAds: (enabled) => {
    set({ personalizedAdsEnabled: enabled });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_PERSONALIZED_ADS, String(enabled));
    }
  },

  updateConsent: (gdpr, ccpa) => {
    set({ gdprConsentGiven: gdpr, ccpaConsentGiven: ccpa });
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_CONSENT, JSON.stringify({ gdpr, ccpa }));
    }
  },
}));
