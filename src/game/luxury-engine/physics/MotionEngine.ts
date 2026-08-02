import { DICE_PHYSICS_CONSTANTS } from '../constants/GameConstants';
import { PhysicsVector3D } from '../types';

export class MotionEngine {
  /**
   * Integrates gravity, air resistance, and linear position step.
   */
  public static updateTranslation(
    position: PhysicsVector3D,
    velocity: PhysicsVector3D,
    dt: number
  ): { position: PhysicsVector3D; velocity: PhysicsVector3D } {
    const nextVelocity = {
      x: velocity.x * DICE_PHYSICS_CONSTANTS.AIR_RESISTANCE,
      y: (velocity.y + DICE_PHYSICS_CONSTANTS.GRAVITY * dt) * DICE_PHYSICS_CONSTANTS.AIR_RESISTANCE,
      z: velocity.z * DICE_PHYSICS_CONSTANTS.AIR_RESISTANCE,
    };

    const nextPosition = {
      x: position.x + velocity.x * dt,
      y: position.y + velocity.y * dt,
      z: position.z + velocity.z * dt,
    };

    return {
      position: nextPosition,
      velocity: nextVelocity,
    };
  }
}
