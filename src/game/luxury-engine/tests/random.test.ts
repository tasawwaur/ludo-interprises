import { SeededRandom } from '../random/SeededRandom';

describe('SeededRandom Tests', () => {
  it('should generate deterministic sequence of values', () => {
    const generator = new SeededRandom(12345);
    const val1 = generator.rollDeterministic();
    const val2 = generator.rollDeterministic();
    
    // Seeded check
    const secondGen = new SeededRandom(12345);
    expect(secondGen.rollDeterministic()).toBe(val1);
    expect(secondGen.rollDeterministic()).toBe(val2);
  });
});
