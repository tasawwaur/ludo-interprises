export const registerUserForTournamentApi = async (tournamentId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 250);
  });
};
export const unregisterUserFromTournamentApi = async (tournamentId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 150);
  });
};
