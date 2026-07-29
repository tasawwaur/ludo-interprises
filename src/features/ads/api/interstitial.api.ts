export const fetchInterstitialLoaded = async (placementId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true); // Ad loaded
    }, 200);
  });
};
