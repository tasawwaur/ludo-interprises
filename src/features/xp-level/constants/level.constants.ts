import { LevelTier } from '../types/level.types';

export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, xpRequired: 500, title: 'Novice Roller', badgeColor: 'from-slate-400 to-slate-600', unlockedFeatures: ['Classic 2P Mode'] },
  { level: 2, xpRequired: 1000, title: 'Token Passer', badgeColor: 'from-slate-300 to-slate-500', unlockedFeatures: ['Chat emotes'] },
  { level: 3, xpRequired: 1500, title: 'Dice Apprentice', badgeColor: 'from-bronze-400 to-bronze-700', unlockedFeatures: ['4P Mode'] },
  { level: 4, xpRequired: 2000, title: 'Casual Strategist', badgeColor: 'from-amber-600 to-amber-800', unlockedFeatures: ['Custom private room'] },
  { level: 5, xpRequired: 3000, title: 'Board Tactician', badgeColor: 'from-yellow-500 to-amber-600', unlockedFeatures: ['Streak Stars Events'] },
  { level: 10, xpRequired: 5000, title: 'Dice Master', badgeColor: 'from-yellow-400 to-amber-500', unlockedFeatures: ['VIP Lounge Access'] },
  { level: 25, xpRequired: 10000, title: 'Ludo Champion', badgeColor: 'from-purple-500 to-indigo-600', unlockedFeatures: ['Elite Tournament Access'] },
  { level: 50, xpRequired: 25000, title: 'Ludo Legend', badgeColor: 'from-pink-500 via-purple-600 to-indigo-700', unlockedFeatures: ['Legendary Dice Customizations'] },
];

export const MAX_LEVEL = 100;
export const BASE_XP = 500;
export const XP_MULTIPLIER = 1.25;
export const LEVEL_TITLES = [
  { level: 1, title: 'Novice Roller' },
  { level: 5, title: 'Board Tactician' },
  { level: 10, title: 'Dice Master' },
  { level: 20, title: 'Ludo Baron' },
  { level: 30, title: 'Crown Collector' },
  { level: 50, title: 'Ludo Legend' },
  { level: 75, title: 'Board Conqueror' },
  { level: 100, title: 'Absolute Deity' },
];
export const LEVEL_COLORS = {
  bronze: 'from-amber-700 via-amber-800 to-amber-950 border-amber-600 text-amber-100',
  silver: 'from-slate-300 via-slate-400 to-slate-500 border-slate-200 text-slate-950',
  gold: 'from-yellow-300 via-yellow-400 to-amber-500 border-yellow-100 text-slate-950',
  platinum: 'from-teal-400 via-cyan-500 to-blue-600 border-cyan-300 text-slate-900',
  diamond: 'from-pink-400 via-purple-500 to-indigo-600 border-purple-300 text-white',
};
export const LEVEL_TIERS_TEXT = [
  'Novice',
  'Bronze',
  'Silver',
  'Gold',
  'Platinum',
  'Diamond',
  'Champion',
  'Legend',
  'Elite',
];
