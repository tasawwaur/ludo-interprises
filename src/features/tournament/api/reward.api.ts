export const claimTournamentRewardApi = async (tournamentId: string, rank: number): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 200);
  });
};
