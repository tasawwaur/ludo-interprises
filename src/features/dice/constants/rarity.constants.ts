import { RarityConfig, RarityType } from '../types/rarity.types';

export const RARITY_CONFIGS: Record<RarityType, RarityConfig> = {
  COMMON: {
    rarity: 'COMMON',
    color: 'text-slate-400 border-slate-500/40',
    bgColor: 'from-slate-800 to-slate-950',
    glowColor: 'shadow-slate-500/10',
    label: 'Common',
  },
  RARE: {
    rarity: 'RARE',
    color: 'text-blue-400 border-blue-500/40',
    bgColor: 'from-blue-950/80 to-slate-950',
    glowColor: 'shadow-blue-500/20',
    label: 'Rare',
  },
  EPIC: {
    rarity: 'EPIC',
    color: 'text-purple-400 border-purple-500/40',
    bgColor: 'from-purple-950/80 to-slate-950',
    glowColor: 'shadow-purple-500/30',
    label: 'Epic',
  },
  LEGENDARY: {
    rarity: 'LEGENDARY',
    color: 'text-amber-400 border-amber-500/50',
    bgColor: 'from-amber-950/50 via-purple-950/80 to-slate-950',
    glowColor: 'shadow-amber-500/40',
    label: 'Legendary',
  },
  MYTHIC: {
    rarity: 'MYTHIC',
    color: 'text-rose-400 border-rose-500/60',
    bgColor: 'from-rose-950/60 via-purple-950/90 to-slate-950',
    glowColor: 'shadow-rose-500/60 animate-pulse',
    label: 'Mythic',
  },
};
