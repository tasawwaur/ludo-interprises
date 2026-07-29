import { useState } from 'react';

export const useAppOpenAd = (placementId: string) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const showAppOpenAd = async (): Promise<boolean> => {
    setIsPlaying(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsPlaying(false);
        resolve(true);
      }, 700);
    });
  };

  return {
    isLoaded: true,
    isPlaying,
    showAppOpenAd,
  };
};
export default useAppOpenAd;
