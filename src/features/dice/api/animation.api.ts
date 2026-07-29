export interface DiceAnimationConfig {
  id: string;
  durationMs: number;
  rotationSpeed: number;
}

export const fetchAnimationConfig = async (visualEffectId: string): Promise<DiceAnimationConfig> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: visualEffectId,
        durationMs: 600,
        rotationSpeed: 10,
      });
    }, 150);
  });
};
