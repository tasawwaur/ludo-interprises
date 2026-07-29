export const registerUpgradeOnServer = async (diceId: string, level: number): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 200);
  });
};
