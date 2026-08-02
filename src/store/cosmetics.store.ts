import { create } from 'zustand';
import { useUserStore } from '../user/user.store';

export interface CosmeticItem {
  id: string;
  name: string;
  type: 'FRAME' | 'TOKEN' | 'BOARD';
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  costCoins?: number;
  costGems?: number;
  styleClass?: string;
  imgUrl?: string;
  colorBg?: string;
  isUnlocked: boolean;
}

const generateFrames = (): CosmeticItem[] => {
  const list: CosmeticItem[] = [
    { id: 'frame_default', name: 'Classic Wood Frame', type: 'FRAME', rarity: 'COMMON', isUnlocked: true, imgUrl: '/assets/images/icons/profile_frame_v3.png' }
  ];
  const colors = ["Gold", "Platinum", "Ruby", "Sapphire", "Emerald", "Diamond", "Obsidian", "Amethyst", "Jade", "Crystal", "Rainbow", "Fire", "Ice", "Shadow", "Stellar", "Cosmic", "Neon", "Cyber", "Royal", "Glitch"];
  const designs = ["Emperor", "Imperial", "Majestic", "Elite", "Grand", "Royal", "Legendary", "Ancient", "Vip", "Champion"];
  
  for (let i = 1; i <= 210; i++) {
    const color = colors[i % colors.length];
    const design = designs[(i >> 1) % designs.length];
    const rarity = i % 4 === 0 ? 'LEGENDARY' : i % 3 === 0 ? 'EPIC' : i % 2 === 0 ? 'RARE' : 'COMMON';
    list.push({
      id: `frame_luxury_${i}`,
      name: `${color} ${design} Frame #${i}`,
      type: 'FRAME',
      rarity,
      costCoins: rarity === 'COMMON' ? 5000 + i * 50 : rarity === 'RARE' ? 12000 + i * 100 : undefined,
      costGems: rarity === 'EPIC' ? 100 + i : rarity === 'LEGENDARY' ? 250 + i * 2 : undefined,
      imgUrl: `/assets/images/icons/profile_frame_v3.png`,
      styleClass: `luxury-frame-style-${i}`,
      isUnlocked: false
    });
  }
  return list;
};

const generateTokens = (): CosmeticItem[] => {
  const list: CosmeticItem[] = [
    { id: 'token_default', name: 'Classic Green Token', type: 'TOKEN', rarity: 'COMMON', isUnlocked: true, colorBg: 'bg-green-600' }
  ];
  const colors = ["Red", "Blue", "Yellow", "Purple", "Pink", "Cyan", "Orange", "Magenta", "Teal", "Lime", "Violet", "Amber", "Rose", "Indigo", "Gold", "Silver", "Bronze", "Emerald", "Ruby", "Sapphire"];
  const styles = ["Shiny", "Glow", "Neon", "Metallic", "Crystal", "Glass", "Chrome", "Glossy", "Marble", "Gradient"];
  
  for (let i = 1; i <= 210; i++) {
    const color = colors[i % colors.length];
    const style = styles[(i >> 1) % styles.length];
    const rarity = i % 4 === 0 ? 'LEGENDARY' : i % 3 === 0 ? 'EPIC' : i % 2 === 0 ? 'RARE' : 'COMMON';
    list.push({
      id: `token_luxury_${i}`,
      name: `${style} ${color} Token #${i}`,
      type: 'TOKEN',
      rarity,
      costCoins: rarity === 'COMMON' ? 3000 + i * 30 : rarity === 'RARE' ? 8000 + i * 50 : undefined,
      costGems: rarity === 'EPIC' ? 50 + i : rarity === 'LEGENDARY' ? 150 + i : undefined,
      colorBg: `bg-${color.toLowerCase()}-600`,
      isUnlocked: false
    });
  }
  return list;
};

const generateBoards = (): CosmeticItem[] => {
  const list: CosmeticItem[] = [
    { id: 'board_default', name: 'Classic Board', type: 'BOARD', rarity: 'COMMON', isUnlocked: true, imgUrl: '/assets/images/board_classic.png' }
  ];
  const themes = ["Royal", "Lux", "Cyber", "Retro", "Cosmic", "Neon", "Classic", "Modern", "Fantasy", "Golden", "Frozen", "Volcanic", "Desert", "Jungle", "Oceanic", "Gothic", "Marble", "Minimalist", "Prismatic", "VIP"];
  const styles = ["Arena", "Table", "Palace", "Chamber", "Board", "Field", "Zone", "Court", "Garden", "Temple"];
  
  for (let i = 1; i <= 210; i++) {
    const theme = themes[i % themes.length];
    const style = styles[(i >> 1) % styles.length];
    const rarity = i % 4 === 0 ? 'LEGENDARY' : i % 3 === 0 ? 'EPIC' : i % 2 === 0 ? 'RARE' : 'COMMON';
    list.push({
      id: `board_luxury_${i}`,
      name: `${theme} ${style} #${i}`,
      type: 'BOARD',
      rarity,
      costCoins: rarity === 'COMMON' ? 10000 + i * 100 : rarity === 'RARE' ? 25000 + i * 200 : undefined,
      costGems: rarity === 'EPIC' ? 200 + i : rarity === 'LEGENDARY' ? 500 + i * 2 : undefined,
      imgUrl: `/assets/images/board_classic.png`,
      isUnlocked: false
    });
  }
  return list;
};

interface CosmeticsState {
  frames: CosmeticItem[];
  tokens: CosmeticItem[];
  boards: CosmeticItem[];
  equippedFrameId: string;
  equippedTokenId: string;
  equippedBoardId: string;

  unlockItem: (itemId: string, type: 'FRAME' | 'TOKEN' | 'BOARD') => boolean;
  equipItem: (itemId: string, type: 'FRAME' | 'TOKEN' | 'BOARD') => boolean;
}

const STORAGE_UNLOCKED_ITEMS = 'ludo_cosmetics_unlocked_list_v1';
const STORAGE_EQUIPPED_ITEMS = 'ludo_cosmetics_equipped_map_v1';

const getInitialItems = (type: 'FRAME' | 'TOKEN' | 'BOARD'): CosmeticItem[] => {
  const defaults = type === 'FRAME' ? generateFrames() : type === 'TOKEN' ? generateTokens() : generateBoards();
  if (typeof window !== 'undefined') {
    try {
      const savedUnlocked = localStorage.getItem(STORAGE_UNLOCKED_ITEMS);
      if (savedUnlocked) {
        const unlockedIds: string[] = JSON.parse(savedUnlocked);
        return defaults.map(item => {
          if (unlockedIds.includes(item.id)) {
            return { ...item, isUnlocked: true };
          }
          return item;
        });
      }
    } catch (e) {
      console.warn('Failed to load unlocked cosmetics', e);
    }
  }
  return defaults;
};

const getInitialEquippedMap = (): Record<string, string> => {
  const defaultMap = {
    FRAME: 'frame_default',
    TOKEN: 'token_default',
    BOARD: 'board_default'
  };
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_EQUIPPED_ITEMS);
      if (saved) {
        return { ...defaultMap, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load equipped cosmetics map', e);
    }
  }
  return defaultMap;
};

export const useCosmeticsStore = create<CosmeticsState>((set, get) => {
  const equippedMap = getInitialEquippedMap();
  return {
    frames: getInitialItems('FRAME'),
    tokens: getInitialItems('TOKEN'),
    boards: getInitialItems('BOARD'),
    equippedFrameId: equippedMap.FRAME || 'frame_default',
    equippedTokenId: equippedMap.TOKEN || 'token_default',
    equippedBoardId: equippedMap.BOARD || 'board_default',

    unlockItem: (itemId, type) => {
      const userStore = useUserStore.getState();
      const user = userStore.user;
      if (!user) return false;

      let itemsList: CosmeticItem[] = [];
      if (type === 'FRAME') itemsList = get().frames;
      else if (type === 'TOKEN') itemsList = get().tokens;
      else if (type === 'BOARD') itemsList = get().boards;

      const target = itemsList.find(i => i.id === itemId);
      if (!target || target.isUnlocked) return false;

      const costCoins = target.costCoins || 0;
      const costGems = target.costGems || 0;

      if (user.coins < costCoins || user.gems < costGems) {
        return false;
      }

      userStore.updateUser({
        coins: user.coins - costCoins,
        gems: user.gems - costGems
      });

      const updated = itemsList.map(item => {
        if (item.id === itemId) return { ...item, isUnlocked: true };
        return item;
      });

      if (type === 'FRAME') set({ frames: updated });
      else if (type === 'TOKEN') set({ tokens: updated });
      else if (type === 'BOARD') set({ boards: updated });

      if (typeof window !== 'undefined') {
        const unlockedIds: string[] = [];
        get().frames.forEach(i => i.isUnlocked && unlockedIds.push(i.id));
        get().tokens.forEach(i => i.isUnlocked && unlockedIds.push(i.id));
        get().boards.forEach(i => i.isUnlocked && unlockedIds.push(i.id));
        localStorage.setItem(STORAGE_UNLOCKED_ITEMS, JSON.stringify(unlockedIds));
      }

      return true;
    },

    equipItem: (itemId, type) => {
      let itemsList: CosmeticItem[] = [];
      if (type === 'FRAME') itemsList = get().frames;
      else if (type === 'TOKEN') itemsList = get().tokens;
      else if (type === 'BOARD') itemsList = get().boards;

      const target = itemsList.find(i => i.id === itemId);
      if (!target || !target.isUnlocked) return false;

      const currentEquipped = getInitialEquippedMap();
      currentEquipped[type] = itemId;

      if (type === 'FRAME') {
        set({ equippedFrameId: itemId });
        const userStore = useUserStore.getState();
        if (userStore.user) {
          userStore.updateUser({
            equippedFrame: itemId
          });
        }
      } else if (type === 'TOKEN') {
        set({ equippedTokenId: itemId });
        const userStore = useUserStore.getState();
        if (userStore.user) {
          userStore.updateUser({
            equippedToken: itemId
          });
        }
      } else if (type === 'BOARD') {
        set({ equippedBoardId: itemId });
        const userStore = useUserStore.getState();
        if (userStore.user) {
          userStore.updateUser({
            equippedBoard: itemId
          });
        }
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_EQUIPPED_ITEMS, JSON.stringify(currentEquipped));
      }

      return true;
    }
  };
});

export const getFrameFilter = (frameId: string | undefined): string => {
  if (!frameId || frameId === 'frame_default') return '';
  const num = parseInt(frameId.replace(/[^\d]/g, ''), 10) || 0;
  
  const hue = (num * 17) % 360;
  const sat = 1.2 + (num % 4) * 0.7;
  const bright = 1.0 + (num % 3) * 0.25;
  
  let glow = 'rgba(245, 158, 11, 0.6)';
  if (num % 4 === 0) glow = 'rgba(239, 68, 68, 0.75)';
  else if (num % 3 === 0) glow = 'rgba(59, 130, 246, 0.75)';
  else if (num % 2 === 0) glow = 'rgba(16, 185, 129, 0.75)';

  return `hue-rotate(${hue}deg) saturate(${sat}) brightness(${bright}) drop-shadow(0 0 5px ${glow})`;
};
