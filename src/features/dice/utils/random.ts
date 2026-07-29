export const generateRandomRoll = (sixChancePercent: number = 16.6): number => {
  // standard chance is 16.6% (1/6). If a player has upgraded Six Chance modifier,
  // we can use a weighted random algorithm to decide if they get a 6.
  const rand = Math.random() * 100;
  
  if (rand < sixChancePercent) {
    return 6;
  }
  
  // Choose randomly from 1 to 5
  const choices = [1, 2, 3, 4, 5];
  const choiceIdx = Math.floor(Math.random() * choices.length);
  return choices[choiceIdx];
};
