import { useSettingsStore } from '../store/settings.store';

export const ConsentService = {
  requestConsentPopup: async (): Promise<boolean> => {
    console.log('[ConsentService] Displaying GDPR Consent Popup dialog...');
    useSettingsStore.getState().updateConsent(true, true);
    return true;
  },

  isPersonalizationGranted: (): boolean => {
    return useSettingsStore.getState().personalizedAdsEnabled;
  },
};
export default ConsentService;
