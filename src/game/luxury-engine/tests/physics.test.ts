import { DicePhysics } from '../physics/DicePhysics';

describe('DicePhysics Tests', () => {
  it('should calculate 90 frames of trajectory', () => {
    const trajectory = DicePhysics.calculateThrowTrajectory(6, 9876);
    expect(trajectory.length).toBe(90);
    // The final frame should settle near height 0
    expect(trajectory[89].position.y).toBeCloseTo(0, 1);
  });
});
