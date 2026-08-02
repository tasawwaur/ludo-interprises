export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number; // Remaining life percentage (1.0 to 0.0)
}

export class EffectController {
  /**
   * Spawns a radial burst of particle structures for victory/landing events.
   */
  public static spawnExplosion(
    cx: number,
    cy: number,
    color: string,
    count: number = 20
  ): Particle[] {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      particles.push({
        id: `particle_${Date.now()}_${i}_${Math.random()}`,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // Gravity drift factor
        color,
        alpha: 1.0,
        life: 1.0,
      });
    }
    return particles;
  }

  /**
   * Updates particle positions and decreases life.
   */
  public static updateParticles(
    particles: Particle[],
    decayRate: number = 0.03
  ): Particle[] {
    return particles
      .map((p) => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vy: p.vy + 0.1, // Gravity acceleration
        alpha: Math.max(0, p.alpha - decayRate),
        life: Math.max(0, p.life - decayRate),
      }))
      .filter((p) => p.life > 0);
  }
}
