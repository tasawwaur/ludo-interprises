export type AdType = 'BANNER' | 'INTERSTITIAL' | 'REWARDED' | 'NATIVE' | 'APP_OPEN';

export type AdState = 'IDLE' | 'LOADING' | 'LOADED' | 'PLAYING' | 'FAILED';

export interface AdConfig {
  id: string;
  type: AdType;
  network: 'ADMOB' | 'UNITY' | 'APPLOVIN' | 'IRONSOURCE';
  placementId: string;
  isTesting: boolean;
}
export interface AdStatus {
  config: AdConfig;
  state: AdState;
  lastLoadedTime?: string;
  error?: string;
}
