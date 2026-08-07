export class DiceEngine {
  public roll() {
    const rand = Math.random();
    if (rand < 0.40) return 6;
    const otherNumbers = [1, 2, 3, 4, 5];
    const idx = Math.floor((rand - 0.40) / 0.12);
    return otherNumbers[Math.min(idx, 4)];
  }
}
