import { useState, useEffect } from 'react';
import { loadNativeAdContent, NativeAdContent } from '../api';

export const useNativeAd = (placementId: string) => {
  const [adContent, setAdContent] = useState<NativeAdContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    loadNativeAdContent(placementId).then((content) => {
      setAdContent(content);
      setIsLoading(false);
    });
  }, [placementId]);

  return {
    adContent,
    isLoading,
  };
};
export default useNativeAd;
