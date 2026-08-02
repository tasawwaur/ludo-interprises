import { DICE_PHYSICS_CONSTANTS } from '../constants/GameConstants';
import { PhysicsVector3D } from '../types';

export class BounceEngine {
  /**
   * Applies bounce reflection, elastic energy decay, and horizontal dampening upon floor collision.
   * Returns updated velocity vector and returns whether bounce is still active.
   */
  public static handleFloorCollision(
    positionY: number,
    velocityY: number,
    velocityX: number,
    velocityZ: number,
    bounceCount: number
  ): {
    newVelocity: PhysicsVector3D;
    newPositionY: number;
    newBounceCount: number;
    isBouncing: boolean;
  } {
    let newPosY = positionY;
    let newVelY = velocityY;
    let newVelX = velocityX;
    let newVelZ = velocityZ;
    let currentBounces = bounceCount;
    let isBouncing = true;

    if (positionY <= 0) {
      newPosY = 0;
      newVelY = -velocityY * DICE_PHYSICS_CONSTANTS.BOUNCE_ELASTICITY;
      currentBounces++;

      // Dampen horizontal speed on bounce
      newVelX *= 0.7;
      newVelZ *= 0.7;

      // Stop bounce calculations if kinetic energy is spent
      if (Math.abs(newVelY) < 0.5 && currentBounces > 3) {
        isBouncing = false;
        newVelX = 0;
        newVelY = 0;
        newVelZ = 0;
      }
    }

    return {
      newVelocity: { x: newVelX, y: newVelY, z: newVelZ },
      newPositionY: newPosY,
      newBounceCount: currentBounces,
      isBouncing,
    };
  }
}
