import { RankingReward } from '../types/reward.types';

export const CHAMPION_REWARDS: RankingReward[] = [
  { rank: 1, label: 'Tournament Champion', coins: 80000, gems: 100, trophies: 5 },
  { rank: 2, label: 'Runner-up', coins: 30000, gems: 50, trophies: 2 },
  { rank: 3, label: 'Semifinalist (3rd Place)', coins: 20000, gems: 20, trophies: 1 },
];
export const PARTICIPATION_XP = 150;
export const WIN_XP_PER_ROUND = 300;
