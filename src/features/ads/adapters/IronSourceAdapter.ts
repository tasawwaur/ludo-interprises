export const IronSourceAdapter = {
  initialize: async (): Promise<boolean> => {
    console.log('[IronSourceAdapter] SDK initialized successfully.');
    return true;
  },

  loadNativeAd: async (placementId: string): Promise<boolean> => {
    console.log(`[IronSourceAdapter] Loading native layout: ${placementId}`);
    return true;
  },
};
export default IronSourceAdapter;
