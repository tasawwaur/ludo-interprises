import { AnimationController } from './AnimationController';
import { DicePhysics } from '../physics/DicePhysics';
import { DicePhysicsState } from '../types';

export class DiceAnimator {
  private controller: AnimationController;

  constructor(controller: AnimationController) {
    this.controller = controller;
  }

  /**
   * Enqueues a dice roll animation using the calculated trajectory path from DicePhysics.
   */
  public animateRoll(
    targetResult: number,
    seed: number,
    onFrameUpdate: (state: DicePhysicsState) => void,
    onComplete: () => void
  ): void {
    const trajectory = DicePhysics.calculateThrowTrajectory(targetResult, seed);
    const frameDurationMs = 16.67; // 60 FPS
    const totalDurationMs = trajectory.length * frameDurationMs;

    this.controller.enqueue({
      id: `dice_roll_${Date.now()}`,
      priority: 'HIGH',
      durationMs: totalDurationMs,
      onUpdate: (progress: number) => {
        const frameIndex = Math.min(
          trajectory.length - 1,
          Math.floor(progress * trajectory.length)
        );
        onFrameUpdate(trajectory[frameIndex]);
      },
      onComplete: onComplete,
    });
  }
}
