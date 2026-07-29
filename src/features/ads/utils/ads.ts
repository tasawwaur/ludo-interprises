import { AdType } from '../types/ads.types';

export const getAdTypeName = (type: AdType): string => {
  switch (type) {
    case 'BANNER': return 'Banner Ad';
    case 'INTERSTITIAL': return 'Interstitial Ad';
    case 'REWARDED': return 'Rewarded Video';
    case 'NATIVE': return 'Native Ad';
    case 'APP_OPEN': return 'App Open Ad';
    default: return 'Ad';
  }
};
export const isAdNetworkConfigured = (placementId: string): boolean => {
  return placementId.trim().length > 0;
};
