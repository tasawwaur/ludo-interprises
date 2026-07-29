export const requestRewardedReward = async (rewardId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 300);
  });
};
export const fetchRewardedStatus = async (placementId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true); // Ad loaded
    }, 150);
  });
};
