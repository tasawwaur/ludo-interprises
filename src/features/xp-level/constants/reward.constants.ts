import { LevelMilestoneReward } from '../types/reward.types';

export const LEVEL_MILESTONE_REWARDS: LevelMilestoneReward[] = [
  {
    level: 2,
    standardReward: { id: 'std_l2', type: 'COINS', amount: 200, name: '200 Coins', icon: '🪙' },
    premiumReward: { id: 'prem_l2', type: 'GEMS', amount: 10, name: '10 Gems', icon: '💎' },
    isClaimed: false,
    isPremiumClaimed: false,
  },
  {
    level: 3,
    standardReward: { id: 'std_l3', type: 'GEMS', amount: 5, name: '5 Gems', icon: '💎' },
    premiumReward: { id: 'prem_l3', type: 'COINS', amount: 500, name: '500 Coins', icon: '🪙' },
    isClaimed: false,
    isPremiumClaimed: false,
  },
  {
    level: 4,
    standardReward: { id: 'std_l4', type: 'COINS', amount: 300, name: '300 Coins', icon: '🪙' },
    premiumReward: { id: 'prem_l4', type: 'CROWNS', amount: 1, name: '1 Crown', icon: '👑' },
    isClaimed: false,
    isPremiumClaimed: false,
  },
  {
    level: 5,
    standardReward: { id: 'std_l5', type: 'EMOTE', amount: 1, name: 'Trophy Dance Emote', icon: '🕺' },
    premiumReward: { id: 'prem_l5', type: 'DICE_SKIN', amount: 1, name: 'Gold Sparkle Dice', icon: '🎲' },
    isClaimed: false,
    isPremiumClaimed: false,
  },
  {
    level: 10,
    standardReward: { id: 'std_l10', type: 'CROWNS', amount: 2, name: '2 Crowns', icon: '👑' },
    premiumReward: { id: 'prem_l10', type: 'AVATAR_FRAME', amount: 1, name: 'Gold Emperor Frame', icon: '🖼️' },
    isClaimed: false,
    isPremiumClaimed: false,
  },
  {
    level: 15,
    standardReward: { id: 'std_l15', type: 'COINS', amount: 1000, name: '1000 Coins', icon: '🪙' },
    premiumReward: { id: 'prem_l15', type: 'GEMS', amount: 50, name: '50 Gems', icon: '💎' },
    isClaimed: false,
    isPremiumClaimed: false,
  },
  {
    level: 20,
    standardReward: { id: 'std_l20', type: 'GEMS', amount: 20, name: '20 Gems', icon: '💎' },
    premiumReward: { id: 'prem_l20', type: 'CROWNS', amount: 5, name: '5 Crowns', icon: '👑' },
    isClaimed: false,
    isPremiumClaimed: false,
  },
];
