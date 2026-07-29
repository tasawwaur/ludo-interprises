export const loadBannerAdApi = async (placementId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true); // Banner ad setup succeeded
    }, 100);
  });
};
export const destroyBannerAdApi = async (placementId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 50);
  });
};
