export type RarityType = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';

export interface RarityConfig {
  rarity: RarityType;
  color: string;      // Tailwind class for border or text
  bgColor: string;    // Tailwind background gradient
  glowColor: string;  // Glow shadow style
  label: string;
}
