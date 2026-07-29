import { AdPlacement } from '../types/placement.types';

export const AD_PLACEMENTS: AdPlacement[] = [
  {
    id: 'home_banner',
    type: 'BANNER',
    description: 'Displays banner ad at the bottom of the home screen.',
    isEnabled: true,
    frequencyCapMinutes: 0,
    dailyCapCount: 999,
  },
  {
    id: 'matchmaker_loading',
    type: 'NATIVE',
    description: 'Displays a custom integrated native ad during matchmaking queue.',
    isEnabled: true,
    frequencyCapMinutes: 1,
    dailyCapCount: 20,
  },
  {
    id: 'match_result_interstitial',
    type: 'INTERSTITIAL',
    description: 'Triggers fullscreen interstitial after finishing an online match.',
    isEnabled: true,
    frequencyCapMinutes: 3,
    dailyCapCount: 10,
  },
  {
    id: 'reward_center_video',
    type: 'REWARDED',
    description: 'Triggered when the user requests a rewarded video for free coins/gems.',
    isEnabled: true,
    frequencyCapMinutes: 5,
    dailyCapCount: 5,
  },
  {
    id: 'app_startup',
    type: 'APP_OPEN',
    description: 'Displays App Open ad during startup splash transitions.',
    isEnabled: true,
    frequencyCapMinutes: 15,
    dailyCapCount: 3,
  },
];
