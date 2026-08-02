import { DicePhysicsState, PhysicsVector3D } from '../types';
import { DICE_PHYSICS_CONSTANTS } from '../constants/GameConstants';
import { BounceEngine } from './BounceEngine';
import { RotationEngine } from './RotationEngine';
import { MotionEngine } from './MotionEngine';

export class DicePhysics {
  /**
   * Generates a complete physics path for a dice throw to deterministically reach the target result.
   */
  public static calculateThrowTrajectory(
    targetResult: number,
    seed: number
  ): DicePhysicsState[] {
    const trajectory: DicePhysicsState[] = [];
    
    // Seeded random parameters for initial force and spin direction
    const hash = Math.sin(seed) * 10000;
    const initialSpinX = (hash - Math.floor(hash)) * 10 + 20;
    const initialSpinY = ((hash * 10) - Math.floor(hash * 10)) * 10 + 20;
    const initialSpinZ = ((hash * 100) - Math.floor(hash * 100)) * 10 + 20;

    let position: PhysicsVector3D = { x: 0, y: 8, z: 0 }; // Dropped from y = 8
    let velocity: PhysicsVector3D = { x: (hash - 0.5) * 4, y: 0, z: ((hash * 10) - 0.5) * 4 };
    let rotation: PhysicsVector3D = { x: 0, y: 0, z: 0 };
    let angularVelocity: PhysicsVector3D = { x: initialSpinX, y: initialSpinY, z: initialSpinZ };

    const dt = 0.016; // 60 FPS time step
    
    let isBouncing = true;
    let bounceCount = 0;

    // Simulate physics for 1.5 seconds (approx 90 frames)
    for (let frame = 0; frame < 90; frame++) {
      if (isBouncing) {
        // Translate update (gravity, air drag, position step)
        const motion = MotionEngine.updateTranslation(position, velocity, dt);
        position = motion.position;
        velocity = motion.velocity;

        // Bounce/Floor collision
        const bounceResult = BounceEngine.handleFloorCollision(
          position.y,
          velocity.y,
          velocity.x,
          velocity.z,
          bounceCount
        );
        position.y = bounceResult.newPositionY;
        velocity = bounceResult.newVelocity;
        bounceCount = bounceResult.newBounceCount;
        isBouncing = bounceResult.isBouncing;

        // Rotate update (spin decay, rotation step)
        const rotUpdate = RotationEngine.updateRotation(rotation, angularVelocity, dt);
        rotation = rotUpdate.rotation;
        angularVelocity = rotUpdate.angularVelocity;
      } else {
        // Linear interpolation to align exactly with target face rotation
        const lerpFactor = 0.15;
        rotation = RotationEngine.lerpToFaceRotation(rotation, targetResult, lerpFactor);
        position.y += (0 - position.y) * lerpFactor;
      }

      // Calculate shadow scaling and glow intensities
      const shadowScale = Math.max(0.2, 1 - (position.y * DICE_PHYSICS_CONSTANTS.SHADOW_SCALE_FACTOR));
      const glowIntensity = !isBouncing ? 1.0 : 0.0;

      trajectory.push({
        position: { ...position },
        rotation: { ...rotation },
        velocity: { ...velocity },
        angularVelocity: { ...angularVelocity },
        scale: 1.0,
        isBouncing,
        shadowScale,
        glowIntensity,
      });
    }

    return trajectory;
  }
}
