import { useState } from 'react';
import { useAdsStore } from '../store/ads.store';

export const useInterstitialAd = (adId: string) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const status = useAdsStore((s) => s.adStatusMap[adId]);

  const showInterstitial = async (): Promise<boolean> => {
    setIsPlaying(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsPlaying(false);
        resolve(true);
      }, 800);
    });
  };

  return {
    isLoaded: status?.state === 'LOADED' || true,
    isPlaying,
    showInterstitial,
  };
};
export default useInterstitialAd;
