export const fetchOpenAppAdLoaded = async (placementId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true); // Ad loaded
    }, 250);
  });
};
