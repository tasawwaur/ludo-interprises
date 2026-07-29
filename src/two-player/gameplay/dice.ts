// Weighted random dice roll: returns 1-6
// Six has a 12% bonus chance to simulate "lucky dice" effect
export const rollDice = (): number => {
  const roll = Math.random() * 100;
  if (roll < 12) return 6;          // 12% chance
  if (roll < 28) return 5;          // 16%
  if (roll < 44) return 4;          // 16%
  if (roll < 60) return 3;          // 16%
  if (roll < 77) return 2;          // 17%
  return 1;                          // remaining ~23%
};

export const isSix = (value: number): boolean => value === 6;
