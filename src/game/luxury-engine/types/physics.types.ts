export interface PhysicsVector3D {
  x: number;
  y: number;
  z: number;
}

export interface DicePhysicsState {
  rotation: PhysicsVector3D;
  angularVelocity: PhysicsVector3D;
  velocity: PhysicsVector3D;
  position: PhysicsVector3D;
  scale: number;
  isBouncing: boolean;
  shadowScale: number;
  glowIntensity: number;
}
