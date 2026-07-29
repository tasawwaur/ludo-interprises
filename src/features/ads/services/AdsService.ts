import { useAdsStore } from '../store/ads.store';
import AdMobAdapter from '../adapters/AdMobAdapter';
import UnityAdsAdapter from '../adapters/UnityAdsAdapter';
import AppLovinAdapter from '../adapters/AppLovinAdapter';
import IronSourceAdapter from '../adapters/IronSourceAdapter';

export const AdsService = {
  initializeSDKs: async (): Promise<boolean> => {
    console.log('[AdsService] Initializing unified SDKs adapters...');
    await AdMobAdapter.initialize();
    await UnityAdsAdapter.initialize('ludo_game_unity_id');
    await AppLovinAdapter.initialize();
    await IronSourceAdapter.initialize();
    return true;
  },

  playAd: async (id: string, type: 'BANNER' | 'INTERSTITIAL' | 'REWARDED' | 'NATIVE' | 'APP_OPEN'): Promise<boolean> => {
    const { updateAdState } = useAdsStore.getState();
    updateAdState(id, 'PLAYING');

    console.log(`[AdsService] Playing ad unit: ${id} (${type})`);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        updateAdState(id, 'LOADED');
        resolve(true);
      }, 800);
    });
  },
};
export default AdsService;
