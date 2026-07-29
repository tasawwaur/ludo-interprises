export interface MatchResultsConfig {
  matchId: string;
  score1: number;
  score2: number;
  winnerId: string;
}

export const submitMatchResultApi = async (config: MatchResultsConfig): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 200);
  });
};
