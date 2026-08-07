// Weighted random dice roll: returns 1-6
// Six has a 40% chance, remaining 60% divided equally among 1-5 (12% each)
export const rollDice = (): number => {
  const rand = Math.random();
  if (rand < 0.40) return 6;
  const otherNumbers = [1, 2, 3, 4, 5];
  const idx = Math.floor((rand - 0.40) / 0.12);
  return otherNumbers[Math.min(idx, 4)];
};

export const isSix = (value: number): boolean => value === 6;
