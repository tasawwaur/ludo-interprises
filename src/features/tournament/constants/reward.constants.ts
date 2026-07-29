import { RankingReward } from '../types/reward.types';

export const CHAMPION_REWARDS: RankingReward[] = [
  { rank: 1, label: 'Tournament Champion', coins: 10000, gems: 50, trophies: 1 },
  { rank: 2, label: 'Runner-up', coins: 4000, gems: 20 },
  { rank: 3, label: 'Semifinalist (3rd-4th)', coins: 1500, gems: 5 },
];
export const PARTICIPATION_XP = 150;
export const WIN_XP_PER_ROUND = 300;
