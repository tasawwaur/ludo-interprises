export const UnityAdsAdapter = {
  initialize: async (gameId: string): Promise<boolean> => {
    console.log(`[UnityAdsAdapter] SDK initialized with Game ID: ${gameId}`);
    return true;
  },

  loadRewardedAd: async (placementId: string): Promise<boolean> => {
    console.log(`[UnityAdsAdapter] Loading Rewarded Ad: ${placementId}`);
    return true;
  },

  showRewardedAd: async (placementId: string, onReward: () => void): Promise<boolean> => {
    console.log(`[UnityAdsAdapter] Displaying Rewarded Ad: ${placementId}`);
    // Simulate playing delay
    return new Promise((resolve) => {
      setTimeout(() => {
        onReward();
        resolve(true);
      }, 1000);
    });
  },
};
export default UnityAdsAdapter;
