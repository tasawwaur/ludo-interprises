export const AdMobAdapter = {
  initialize: async (): Promise<boolean> => {
    console.log('[AdMobAdapter] SDK initialized successfully.');
    return true;
  },

  loadBanner: async (placementId: string): Promise<boolean> => {
    console.log(`[AdMobAdapter] Loading banner for placement: ${placementId}`);
    return true;
  },

  showAppOpenAd: async (placementId: string): Promise<boolean> => {
    console.log(`[AdMobAdapter] Displaying App Open ad: ${placementId}`);
    return true;
  },
};
export default AdMobAdapter;
