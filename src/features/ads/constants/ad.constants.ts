import { AdConfig } from '../types/ads.types';

export const AD_NETWORKS: Array<'ADMOB' | 'UNITY' | 'APPLOVIN' | 'IRONSOURCE'> = [
  'ADMOB',
  'UNITY',
  'APPLOVIN',
  'IRONSOURCE',
];

export const INITIAL_AD_CONFIGS: AdConfig[] = [
  { id: 'ad_banner_1', type: 'BANNER', network: 'ADMOB', placementId: 'ca-app-pub-3940256099942544/6300978111', isTesting: true },
  { id: 'ad_interstitial_1', type: 'INTERSTITIAL', network: 'APPLOVIN', placementId: 'applovin_inter_home', isTesting: true },
  { id: 'ad_rewarded_1', type: 'REWARDED', network: 'UNITY', placementId: 'unity_rewarded_video', isTesting: true },
  { id: 'ad_native_1', type: 'NATIVE', network: 'IRONSOURCE', placementId: 'iron_native_lobby', isTesting: true },
  { id: 'ad_app_open_1', type: 'APP_OPEN', network: 'ADMOB', placementId: 'ca-app-pub-3940256099942544/3419835294', isTesting: true },
];
