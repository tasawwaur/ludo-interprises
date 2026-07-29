import { useState } from 'react';
import { loadBannerAdApi, destroyBannerAdApi } from '../api';

export const useBannerAd = (placementId: string) => {
  const [isLoaded, setIsLoaded] = useState(false);

  const loadBanner = async () => {
    const success = await loadBannerAdApi(placementId);
    setIsLoaded(success);
  };

  const destroyBanner = async () => {
    await destroyBannerAdApi(placementId);
    setIsLoaded(false);
  };

  return {
    isLoaded,
    loadBanner,
    destroyBanner,
  };
};
export default useBannerAd;
