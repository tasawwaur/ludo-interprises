import { AdConfig } from '../types/ads.types';
import { INITIAL_AD_CONFIGS } from '../constants/ad.constants';

export const loadAdConfigFromServer = async (): Promise<AdConfig[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(INITIAL_AD_CONFIGS);
    }, 200);
  });
};
