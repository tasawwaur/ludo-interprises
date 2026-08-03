// Custom visual themes and styles helper for Ludo Enterprise cosmetics

const FRAME_COLORS = ["Gold", "Platinum", "Ruby", "Sapphire", "Emerald", "Diamond", "Obsidian", "Amethyst", "Jade", "Crystal", "Rainbow", "Fire", "Ice", "Shadow", "Stellar", "Cosmic", "Neon", "Cyber", "Royal", "Glitch"];
const FRAME_DESIGNS = ["Emperor", "Imperial", "Majestic", "Elite", "Grand", "Royal", "Legendary", "Ancient", "Vip", "Champion"];

const TOKEN_COLORS = ["Red", "Blue", "Yellow", "Purple", "Pink", "Cyan", "Orange", "Magenta", "Teal", "Lime", "Violet", "Amber", "Rose", "Indigo", "Gold", "Silver", "Bronze", "Emerald", "Ruby", "Sapphire"];
const TOKEN_STYLES = ["Shiny", "Glow", "Neon", "Metallic", "Crystal", "Glass", "Chrome", "Glossy", "Marble", "Gradient"];

const BOARD_THEMES = ["Royal", "Lux", "Cyber", "Retro", "Cosmic", "Neon", "Classic", "Modern", "Fantasy", "Golden", "Frozen", "Volcanic", "Desert", "Jungle", "Oceanic", "Gothic", "Marble", "Minimalist", "Prismatic", "VIP"];

const DICE_COLORS = ["Diamond", "Ruby", "Sapphire", "Emerald", "Platinum", "Gold", "Obsidian", "Amethyst", "Opal", "Bronze", "Silver", "Amber", "Quartz", "Jade", "Crystal", "Cosmic", "Neon", "Cyber", "Royal", "Shadow", "Solstice", "Nebula", "Galaxy", "Solar", "Lunar", "Stellar", "Astral", "Chrono", "Aero", "Aqua", "Pyro", "Terra", "Volt", "Plasma", "Glitch", "Retro", "Steampunk", "Victorian", "Gothic", "Ancient", "Prismatic", "Glitter", "Spectre", "Void", "Ethereal", "Mythic", "Divine", "Celestial"];

// Helper to extract index from ID e.g. token_luxury_15 -> 15
function getIndex(id: string): number {
  const match = id.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// 🎲 DICE STYLING
export interface DiceStyle {
  bgGradient: string;
  borderColor: string;
  dotColor: string;
  shadowColor: string;
  glowClass: string;
  particles: 'fire' | 'sparks' | 'gold_dust' | 'none';
}

export function getDiceStyle(diceId: string): DiceStyle {
  if (diceId === 'dice_classic') {
    return {
      bgGradient: 'from-amber-50 via-amber-100 to-amber-200',
      borderColor: 'border-amber-300',
      dotColor: '#0f172a',
      shadowColor: 'rgba(0,0,0,0.5)',
      glowClass: 'shadow-[0_0_15px_rgba(251,191,36,0.3)]',
      particles: 'none'
    };
  }
  if (diceId === 'dice_lucky_star') {
    return {
      bgGradient: 'from-cyan-400 via-blue-500 to-indigo-600',
      borderColor: 'border-cyan-300',
      dotColor: '#ffffff',
      shadowColor: 'rgba(34,211,238,0.6)',
      glowClass: 'shadow-[0_0_20px_rgba(34,211,238,0.55)]',
      particles: 'sparks'
    };
  }
  if (diceId === 'dice_volcano') {
    return {
      bgGradient: 'from-orange-500 via-red-600 to-amber-950',
      borderColor: 'border-orange-400',
      dotColor: '#ffe4e6',
      shadowColor: 'rgba(239,68,68,0.7)',
      glowClass: 'shadow-[0_0_25px_rgba(239,68,68,0.65)]',
      particles: 'fire'
    };
  }
  if (diceId === 'dice_emperor') {
    return {
      bgGradient: 'from-yellow-300 via-amber-400 to-yellow-600',
      borderColor: 'border-yellow-200',
      dotColor: '#451a03',
      shadowColor: 'rgba(245,158,11,0.8)',
      glowClass: 'shadow-[0_0_30px_rgba(245,158,11,0.7)]',
      particles: 'gold_dust'
    };
  }

  const idx = getIndex(diceId);
  const color = DICE_COLORS[idx % DICE_COLORS.length];

  let bgGradient = 'from-slate-100 to-slate-300';
  let borderColor = 'border-slate-400';
  let dotColor = '#1e293b';
  let shadowColor = 'rgba(0,0,0,0.3)';
  let glowClass = 'shadow-[0_0_12px_rgba(255,255,255,0.2)]';
  let particles: 'fire' | 'sparks' | 'gold_dust' | 'none' = 'none';

  switch (color) {
    case 'Gold':
    case 'Solar':
    case 'Yellow':
    case 'Amber':
      bgGradient = 'from-yellow-300 via-amber-400 to-yellow-600';
      borderColor = 'border-yellow-200';
      dotColor = '#78350f';
      shadowColor = 'rgba(245,158,11,0.6)';
      glowClass = 'shadow-[0_0_20px_rgba(245,158,11,0.5)]';
      particles = 'gold_dust';
      break;
    case 'Ruby':
    case 'Pyro':
    case 'Solaris':
    case 'Red':
    case 'Plasma':
      bgGradient = 'from-red-500 via-rose-600 to-amber-950';
      borderColor = 'border-rose-400';
      dotColor = '#ffe4e6';
      shadowColor = 'rgba(244,63,94,0.6)';
      glowClass = 'shadow-[0_0_20px_rgba(244,63,94,0.5)]';
      particles = 'fire';
      break;
    case 'Sapphire':
    case 'Aqua':
    case 'Blue':
    case 'Stellar':
    case 'Stardust':
    case 'Nebula':
      bgGradient = 'from-cyan-400 via-blue-500 to-indigo-800';
      borderColor = 'border-cyan-300';
      dotColor = '#ffffff';
      shadowColor = 'rgba(59,130,246,0.6)';
      glowClass = 'shadow-[0_0_20px_rgba(59,130,246,0.5)]';
      particles = 'sparks';
      break;
    case 'Emerald':
    case 'Jade':
    case 'Green':
    case 'Terra':
      bgGradient = 'from-emerald-400 via-green-500 to-emerald-800';
      borderColor = 'border-emerald-300';
      dotColor = '#f0fdf4';
      shadowColor = 'rgba(16,185,129,0.5)';
      glowClass = 'shadow-[0_0_20px_rgba(16,185,129,0.45)]';
      break;
    case 'Obsidian':
    case 'Shadow':
    case 'Gothic':
    case 'Void':
    case 'Ethereal':
      bgGradient = 'from-slate-800 via-zinc-900 to-black';
      borderColor = 'border-purple-600';
      dotColor = '#d8b4fe';
      shadowColor = 'rgba(168,85,247,0.8)';
      glowClass = 'shadow-[0_0_22px_rgba(168,85,247,0.6)]';
      particles = 'sparks';
      break;
    case 'Amethyst':
    case 'Cosmic':
    case 'Solstice':
    case 'Galaxy':
      bgGradient = 'from-purple-400 via-indigo-600 to-purple-950';
      borderColor = 'border-purple-300';
      dotColor = '#fae8ff';
      shadowColor = 'rgba(217,70,239,0.6)';
      glowClass = 'shadow-[0_0_20px_rgba(217,70,239,0.5)]';
      break;
    case 'Neon':
    case 'Cyber':
    case 'Glitch':
    case 'Volt':
      bgGradient = 'from-fuchsia-500 via-pink-600 to-cyan-500';
      borderColor = 'border-pink-300';
      dotColor = '#00ffff';
      shadowColor = 'rgba(236,72,153,0.7)';
      glowClass = 'shadow-[0_0_25px_rgba(0,255,255,0.6)] animate-pulse';
      particles = 'sparks';
      break;
    case 'Diamond':
    case 'Crystal':
    case 'Platinum':
    case 'Silver':
      bgGradient = 'from-slate-100 via-indigo-50 to-slate-300';
      borderColor = 'border-white';
      dotColor = '#1e3a8a';
      shadowColor = 'rgba(147,197,253,0.5)';
      glowClass = 'shadow-[0_0_18px_rgba(255,255,255,0.7)]';
      break;
    default:
      // Modulo color styling for variety
      const hue = (idx * 27) % 360;
      bgGradient = `from-indigo-600 to-indigo-950`;
      borderColor = 'border-white/30';
      dotColor = '#ffffff';
      shadowColor = `rgba(255,255,255,0.2)`;
  }

  return { bgGradient, borderColor, dotColor, shadowColor, glowClass, particles };
}

// 👤 PROFILE FRAMES STYLING
export interface FrameStyle {
  borderClass: string;
  shadowClass: string;
  glowColor: string;
  animationClass: string;
  cornerStyle: string;
  colorName: string;
}

export function getFrameStyle(frameId: string): FrameStyle {
  if (frameId === 'frame_default') {
    return {
      borderClass: 'border-amber-700/50 bg-gradient-to-br from-amber-600/30 to-amber-950/20',
      shadowClass: 'shadow-md',
      glowColor: 'transparent',
      animationClass: '',
      cornerStyle: '',
      colorName: 'Classic Wood'
    };
  }

  const idx = getIndex(frameId);
  const color = FRAME_COLORS[idx % FRAME_COLORS.length];

  let borderClass = 'border-amber-400 bg-gradient-to-r from-yellow-300 to-amber-500';
  let shadowClass = 'shadow-[0_0_10px_rgba(245,158,11,0.5)]';
  let glowColor = 'rgba(245,158,11,0.3)';
  let animationClass = 'animate-pulse';
  let cornerStyle = 'after:content-["✦"] after:text-[7px] after:text-yellow-200 after:absolute after:-top-1 after:-left-1';

  switch (color) {
    case 'Gold':
    case 'Royal':
    case 'VIP':
    case 'Emperor':
      borderClass = 'border-amber-400 bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500';
      shadowClass = 'shadow-[0_0_12px_rgba(251,191,36,0.6)]';
      glowColor = 'rgba(251,191,36,0.4)';
      animationClass = 'hover:scale-105 transition-transform';
      cornerStyle = 'before:content-["👑"] before:text-[9px] before:absolute before:-top-3 before:left-1/2 before:-translate-x-1/2 before:z-30';
      break;
    case 'Ruby':
    case 'Fire':
      borderClass = 'border-red-500 bg-gradient-to-r from-rose-500 via-red-600 to-orange-500';
      shadowClass = 'shadow-[0_0_15px_rgba(239,68,68,0.7)]';
      glowColor = 'rgba(239,68,68,0.5)';
      animationClass = 'animate-[pulse_1.5s_infinite]';
      cornerStyle = 'after:content-["🔥"] after:text-[8px] after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2';
      break;
    case 'Sapphire':
    case 'Stellar':
    case 'Ice':
      borderClass = 'border-blue-400 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600';
      shadowClass = 'shadow-[0_0_15px_rgba(59,130,246,0.7)]';
      glowColor = 'rgba(59,130,246,0.45)';
      animationClass = 'animate-[pulse_2s_infinite]';
      cornerStyle = 'after:content-["❄️"] after:text-[7px] after:absolute after:-top-1.5 after:right-1';
      break;
    case 'Emerald':
    case 'Jade':
      borderClass = 'border-emerald-400 bg-gradient-to-r from-emerald-400 via-green-500 to-teal-600';
      shadowClass = 'shadow-[0_0_12px_rgba(16,185,129,0.6)]';
      glowColor = 'rgba(16,185,129,0.4)';
      break;
    case 'Cyber':
    case 'Neon':
    case 'Glitch':
      borderClass = 'border-pink-500 bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-400';
      shadowClass = 'shadow-[0_0_18px_rgba(236,72,153,0.8)]';
      glowColor = 'rgba(0,255,255,0.5)';
      animationClass = 'animate-pulse';
      cornerStyle = 'after:content-["⚡"] after:text-[8px] after:absolute after:-top-1.5 after:-right-1';
      break;
    case 'Obsidian':
    case 'Shadow':
      borderClass = 'border-slate-700 bg-gradient-to-r from-slate-800 via-zinc-950 to-slate-900';
      shadowClass = 'shadow-[0_0_10px_rgba(0,0,0,0.8)]';
      glowColor = 'rgba(0,0,0,0.5)';
      animationClass = '';
      cornerStyle = 'after:content-["💀"] after:text-[7px] after:absolute after:-bottom-1.5 after:right-1';
      break;
    case 'Rainbow':
      borderClass = 'border-white bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-purple-500';
      shadowClass = 'shadow-[0_0_16px_rgba(255,255,255,0.6)]';
      glowColor = 'rgba(255,255,255,0.3)';
      animationClass = 'animate-pulse';
      break;
    default:
      const hue = (idx * 18) % 360;
      borderClass = `border-slate-200 bg-gradient-to-r from-indigo-500 to-purple-600`;
      shadowClass = `shadow-[0_0_10px_rgba(255,255,255,0.4)]`;
      glowColor = `rgba(255,255,255,0.2)`;
  }

  return { borderClass, shadowClass, glowColor, animationClass, cornerStyle, colorName: color };
}

// 🔵 TOKENS / PAWNS STYLING
export interface TokenStyle {
  primaryColor: string;
  secondaryColor: string;
  shadowColor: string;
  glowColor: string;
  styleName: string;
  gradientColors: string[];
  isGlossy: boolean;
  isMetallic: boolean;
  isNeon: boolean;
  isGlass: boolean;
  isMarble: boolean;
  colorName: string;
}

export function getTokenStyle(tokenId: string): TokenStyle {
  if (tokenId === 'token_default') {
    return {
      primaryColor: '#16a34a',
      secondaryColor: '#15803d',
      shadowColor: 'rgba(0,0,0,0.35)',
      glowColor: 'transparent',
      styleName: 'Classic',
      gradientColors: ['#16a34a', '#15803d'],
      isGlossy: true,
      isMetallic: false,
      isNeon: false,
      isGlass: false,
      isMarble: false,
      colorName: 'Green'
    };
  }

  const idx = getIndex(tokenId);
  const colorName = TOKEN_COLORS[idx % TOKEN_COLORS.length];
  const styleName = TOKEN_STYLES[(idx >> 1) % TOKEN_STYLES.length];

  // Resolve color values
  let primaryColor = '#3b82f6';
  let secondaryColor = '#1d4ed8';
  let glowColor = 'rgba(59,130,246,0.4)';

  const colorsMap: Record<string, { pri: string; sec: string; glow: string }> = {
    Red: { pri: '#ef4444', sec: '#b91c1c', glow: 'rgba(239,68,68,0.5)' },
    Blue: { pri: '#3b82f6', sec: '#1d4ed8', glow: 'rgba(59,130,246,0.5)' },
    Yellow: { pri: '#facc15', sec: '#ca8a04', glow: 'rgba(250,204,21,0.5)' },
    Purple: { pri: '#a855f7', sec: '#7e22ce', glow: 'rgba(168,85,247,0.5)' },
    Pink: { pri: '#ec4899', sec: '#be185d', glow: 'rgba(236,72,153,0.5)' },
    Cyan: { pri: '#06b6d4', sec: '#0891b2', glow: 'rgba(6,182,212,0.5)' },
    Orange: { pri: '#f97316', sec: '#c2410c', glow: 'rgba(249,115,22,0.5)' },
    Magenta: { pri: '#d946ef', sec: '#a21caf', glow: 'rgba(217,70,239,0.5)' },
    Teal: { pri: '#14b8a6', sec: '#0f766e', glow: 'rgba(20,184,166,0.5)' },
    Lime: { pri: '#84cc16', sec: '#4d7c0f', glow: 'rgba(132,204,22,0.5)' },
    Violet: { pri: '#7c3aed', sec: '#5b21b6', glow: 'rgba(124,58,237,0.5)' },
    Amber: { pri: '#f59e0b', sec: '#b45309', glow: 'rgba(245,158,11,0.5)' },
    Rose: { pri: '#fda4af', sec: '#f43f5e', glow: 'rgba(244,63,94,0.5)' },
    Indigo: { pri: '#6366f1', sec: '#4338ca', glow: 'rgba(99,102,241,0.5)' },
    Gold: { pri: '#fbbf24', sec: '#ca8a04', glow: 'rgba(251,191,36,0.6)' },
    Silver: { pri: '#cbd5e1', sec: '#94a3b8', glow: 'rgba(203,213,225,0.4)' },
    Bronze: { pri: '#d97706', sec: '#78350f', glow: 'rgba(217,119,6,0.4)' },
    Emerald: { pri: '#10b981', sec: '#047857', glow: 'rgba(16,185,129,0.5)' },
    Ruby: { pri: '#e11d48', sec: '#9f1239', glow: 'rgba(225,29,72,0.5)' },
    Sapphire: { pri: '#2563eb', sec: '#1e40af', glow: 'rgba(37,99,235,0.5)' },
  };

  const itemCol = colorsMap[colorName] || colorsMap.Blue;
  primaryColor = itemCol.pri;
  secondaryColor = itemCol.sec;
  glowColor = itemCol.glow;

  let gradientColors = [primaryColor, secondaryColor];
  let isGlossy = true;
  let isMetallic = false;
  let isNeon = false;
  let isGlass = false;
  let isMarble = false;

  switch (styleName) {
    case 'Metallic':
    case 'Chrome':
      isMetallic = true;
      gradientColors = ['#ffffff', primaryColor, secondaryColor, '#111827'];
      break;
    case 'Neon':
    case 'Glow':
      isNeon = true;
      glowColor = primaryColor;
      break;
    case 'Crystal':
    case 'Glass':
      isGlass = true;
      gradientColors = ['rgba(255,255,255,0.75)', `${primaryColor}aa`, `${secondaryColor}88`];
      break;
    case 'Marble':
      isMarble = true;
      gradientColors = [primaryColor, '#cbd5e1', secondaryColor, '#334155'];
      break;
    case 'Gradient':
      gradientColors = [primaryColor, '#ec4899', secondaryColor];
      break;
    case 'Shiny':
    case 'Glossy':
    default:
      isGlossy = true;
  }

  return {
    primaryColor,
    secondaryColor,
    shadowColor: 'rgba(0,0,0,0.45)',
    glowColor,
    styleName,
    gradientColors,
    isGlossy,
    isMetallic,
    isNeon,
    isGlass,
    isMarble,
    colorName
  };
}

// 🗺️ LUDO BOARDS STYLING
export interface BoardTheme {
  boardBg: string;
  gridBorder: string;
  safeStarColor: string;
  centralStarColor: string;
  frameOuter: string;
  frameInner: string;
  
  // Custom House Fill colors
  redFill: [string, string];
  greenFill: [string, string];
  yellowFill: [string, string];
  blueFill: [string, string];
  themeName: string;
}

export function getBoardTheme(boardId: string): BoardTheme {
  const defaultTheme: BoardTheme = {
    boardBg: '#fafaf9',
    gridBorder: '#cbd5e1',
    safeStarColor: '#fbbf24',
    centralStarColor: '#ffffff',
    frameOuter: '#9d174d',
    frameInner: '#be185d',
    redFill: ['#881337', '#be123c'],
    greenFill: ['#064e3b', '#047857'],
    yellowFill: ['#78350f', '#d97706'],
    blueFill: ['#1e3a8a', '#1d4ed8'],
    themeName: 'Classic'
  };

  if (boardId === 'board_default') {
    return defaultTheme;
  }

  const idx = getIndex(boardId);
  const theme = BOARD_THEMES[idx % BOARD_THEMES.length];

  switch (theme) {
    case 'Volcanic':
      return {
        boardBg: '#0f0505',
        gridBorder: '#450a0a',
        safeStarColor: '#f97316',
        centralStarColor: '#ef4444',
        frameOuter: '#450a0a',
        frameInner: '#7f1d1d',
        redFill: ['#450a0a', '#ef4444'],
        greenFill: ['#1c0c02', '#d97706'],
        yellowFill: ['#1f0a0a', '#f97316'],
        blueFill: ['#0a0505', '#7f1d1d'],
        themeName: 'Volcanic'
      };
    case 'Cyber':
    case 'Neon':
      return {
        boardBg: '#030712',
        gridBorder: '#3b82f6',
        safeStarColor: '#00ffff',
        centralStarColor: '#ec4899',
        frameOuter: '#0f172a',
        frameInner: '#1e1b4b',
        redFill: ['#111827', '#ec4899'],
        greenFill: ['#0b132b', '#10b981'],
        yellowFill: ['#1c1917', '#eab308'],
        blueFill: ['#030712', '#3b82f6'],
        themeName: 'Cyber Neon'
      };
    case 'Frozen':
      return {
        boardBg: '#f0f9ff',
        gridBorder: '#bae6fd',
        safeStarColor: '#38bdf8',
        centralStarColor: '#ffffff',
        frameOuter: '#0c4a6e',
        frameInner: '#0369a1',
        redFill: ['#082f49', '#38bdf8'],
        greenFill: ['#0f172a', '#06b6d4'],
        yellowFill: ['#0c4a6e', '#7dd3fc'],
        blueFill: ['#0284c7', '#e0f2fe'],
        themeName: 'Frozen'
      };
    case 'Golden':
    case 'VIP':
    case 'Lux':
      return {
        boardBg: '#fefcbf',
        gridBorder: '#ca8a04',
        safeStarColor: '#fef08a',
        centralStarColor: '#fbbf24',
        frameOuter: '#451a03',
        frameInner: '#78350f',
        redFill: ['#78350f', '#fbbf24'],
        greenFill: ['#451a03', '#d97706'],
        yellowFill: ['#ca8a04', '#fef08a'],
        blueFill: ['#b45309', '#eab308'],
        themeName: 'Golden VIP'
      };
    case 'Marble':
      return {
        boardBg: '#f1f5f9',
        gridBorder: '#94a3b8',
        safeStarColor: '#64748b',
        centralStarColor: '#cbd5e1',
        frameOuter: '#334155',
        frameInner: '#475569',
        redFill: ['#1e293b', '#64748b'],
        greenFill: ['#0f172a', '#475569'],
        yellowFill: ['#334155', '#94a3b8'],
        blueFill: ['#1e293b', '#cbd5e1'],
        themeName: 'Marble'
      };
    case 'Retro':
      return {
        boardBg: '#fdf6e3',
        gridBorder: '#93a1a1',
        safeStarColor: '#b58900',
        centralStarColor: '#268bd2',
        frameOuter: '#073642',
        frameInner: '#586e75',
        redFill: ['#073642', '#dc322f'],
        greenFill: ['#002b36', '#859900'],
        yellowFill: ['#586e75', '#b58900'],
        blueFill: ['#073642', '#268bd2'],
        themeName: 'Retro'
      };
    case 'Minimalist':
      return {
        boardBg: '#ffffff',
        gridBorder: '#e2e8f0',
        safeStarColor: '#94a3b8',
        centralStarColor: '#f1f5f9',
        frameOuter: '#0f172a',
        frameInner: '#1e293b',
        redFill: ['#0f172a', '#cbd5e1'],
        greenFill: ['#0f172a', '#e2e8f0'],
        yellowFill: ['#1e293b', '#f1f5f9'],
        blueFill: ['#0f172a', '#94a3b8'],
        themeName: 'Minimalist'
      };
    default:
      return defaultTheme;
  }
}
