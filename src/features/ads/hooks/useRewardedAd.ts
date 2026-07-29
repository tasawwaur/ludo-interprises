import { useState } from 'react';
import { useAdsStore } from '../store/ads.store';
import { requestRewardedReward } from '../api';
import RewardService from '../services/RewardService';

export const useRewardedAd = (adId: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const status = useAdsStore((s) => s.adStatusMap[adId]);

  const showRewarded = async (rewardId: string): Promise<boolean> => {
    setIsPlaying(true);
    
    return new Promise((resolve) => {
      setTimeout(async () => {
        const success = await RewardService.claimRewardedAd(rewardId);
        setIsPlaying(false);
        resolve(success);
      }, 1000);
    });
  };

  return {
    isLoaded: status?.state === 'LOADED' || true,
    isPlaying,
    showRewarded,
  };
};
export default useRewardedAd;
