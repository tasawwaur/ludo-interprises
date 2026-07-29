import { AdReward } from '../types/reward.types';

export const AD_REWARDS: AdReward[] = [
  {
    id: 'rew_daily_coins',
    type: 'FREE_COINS',
    amount: 150,
    label: 'Claim Free 150 Coins',
    icon: '🪙',
  },
  {
    id: 'rew_daily_gems',
    type: 'FREE_GEMS',
    amount: 2,
    label: 'Claim Free 2 Gems',
    icon: '💎',
  },
  {
    id: 'rew_double_match_xp',
    type: 'EXTRA_XP',
    amount: 50,
    label: 'Get Extra 50 XP',
    icon: '⭐',
  },
];
export const REWARD_COOLDOWN_MINUTES = 10;
