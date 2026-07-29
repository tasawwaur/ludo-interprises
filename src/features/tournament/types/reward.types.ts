export interface RankingReward {
  rank: number;
  label: string;
  coins?: number;
  gems?: number;
  trophies?: number;
}

export interface TournamentRewardsConfig {
  tournamentId: string;
  rewards: RankingReward[];
}
