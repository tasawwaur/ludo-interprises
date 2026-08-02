import { DICE_PHYSICS_CONSTANTS } from '../constants/GameConstants';
import { PhysicsVector3D } from '../types';

export class RotationEngine {
  // Hardcoded face orientations (Euler angles in radians) for faces 1 to 6
  public static FACE_ROTATIONS: Record<number, PhysicsVector3D> = {
    1: { x: 0, y: 0, z: 0 },
    2: { x: 0, y: Math.PI / 2, z: 0 },
    3: { x: -Math.PI / 2, y: 0, z: 0 },
    4: { x: Math.PI / 2, y: 0, z: 0 },
    5: { x: 0, y: -Math.PI / 2, z: 0 },
    6: { x: Math.PI, y: 0, z: 0 },
  };

  /**
   * Applies spin decay and integrates Euler rotation values.
   */
  public static updateRotation(
    rotation: PhysicsVector3D,
    angularVelocity: PhysicsVector3D,
    dt: number
  ): { rotation: PhysicsVector3D; angularVelocity: PhysicsVector3D } {
    return {
      angularVelocity: {
        x: angularVelocity.x * DICE_PHYSICS_CONSTANTS.SPIN_FRICTION,
        y: angularVelocity.y * DICE_PHYSICS_CONSTANTS.SPIN_FRICTION,
        z: angularVelocity.z * DICE_PHYSICS_CONSTANTS.SPIN_FRICTION,
      },
      rotation: {
        x: rotation.x + angularVelocity.x * dt,
        y: rotation.y + angularVelocity.y * dt,
        z: rotation.z + angularVelocity.z * dt,
      },
    };
  }

  /**
   * Linearly interpolates (Slerp-like Lerp for angles) rotation to land flat on target face.
   */
  public static lerpToFaceRotation(
    currentRot: PhysicsVector3D,
    targetFace: number,
    lerpFactor: number
  ): PhysicsVector3D {
    const targetRot = this.FACE_ROTATIONS[targetFace] || { x: 0, y: 0, z: 0 };
    return {
      x: currentRot.x + (targetRot.x - currentRot.x) * lerpFactor,
      y: currentRot.y + (targetRot.y - currentRot.y) * lerpFactor,
      z: currentRot.z + (targetRot.z - currentRot.z) * lerpFactor,
    };
  }
}
