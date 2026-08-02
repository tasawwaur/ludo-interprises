import { DiceItem } from '../types/dice.types';

const INITIAL_STATIC_ITEMS: DiceItem[] = [
  {
    id: 'dice_classic',
    name: 'Classic Bone',
    description: 'The standard bone dice trusted by ludo rollers for generations.',
    rarity: 'COMMON',
    level: 1,
    maxLevel: 5,
    isUnlocked: true,
    isEquipped: true,
    isFavorite: false,
    cost: {},
    attributes: {
      rollModifier: { name: 'Six Chance', value: 16.6, maxValue: 20 },
      goldBonus: { name: 'Gold Multiplier', value: 1.0, maxValue: 1.5 },
      xpBonus: { name: 'XP Multiplier', value: 1.0, maxValue: 1.5 },
    },
    visualEffectId: 'glow_default',
    soundEffectId: 'roll_classic',
    skinId: 'skin_classic_white',
  },
  {
    id: 'dice_lucky_star',
    name: 'Lucky Star',
    description: 'Infused with cosmic dust to slightly improve high rolls.',
    rarity: 'RARE',
    level: 1,
    maxLevel: 10,
    isUnlocked: false,
    isEquipped: false,
    isFavorite: false,
    cost: { coins: 5000 },
    attributes: {
      rollModifier: { name: 'Six Chance', value: 17.2, maxValue: 22 },
      goldBonus: { name: 'Gold Multiplier', value: 1.1, maxValue: 1.8 },
      xpBonus: { name: 'XP Multiplier', value: 1.1, maxValue: 1.8 },
    },
    visualEffectId: 'glow_blue',
    soundEffectId: 'roll_glass',
    skinId: 'skin_star_cyan',
  },
  {
    id: 'dice_volcano',
    name: 'Magma core',
    description: 'Forged in volcanic depths. Emits embers when rolled.',
    rarity: 'EPIC',
    level: 1,
    maxLevel: 10,
    isUnlocked: false,
    isEquipped: false,
    isFavorite: false,
    cost: { gems: 100 },
    attributes: {
      rollModifier: { name: 'Six Chance', value: 18.0, maxValue: 25 },
      goldBonus: { name: 'Gold Multiplier', value: 1.25, maxValue: 2.2 },
      xpBonus: { name: 'XP Multiplier', value: 1.25, maxValue: 2.2 },
    },
    visualEffectId: 'glow_red',
    soundEffectId: 'roll_heavy',
    skinId: 'skin_magma_orange',
  },
  {
    id: 'dice_emperor',
    name: 'Emperor Gold',
    description: 'Ornate gold frame with floating gold dust. Fits Ludo Royalty.',
    rarity: 'LEGENDARY',
    level: 1,
    maxLevel: 15,
    isUnlocked: false,
    isEquipped: false,
    isFavorite: false,
    cost: { gems: 250 },
    attributes: {
      rollModifier: { name: 'Six Chance', value: 19.5, maxValue: 28 },
      goldBonus: { name: 'Gold Multiplier', value: 1.5, maxValue: 3.0 },
      xpBonus: { name: 'XP Multiplier', value: 1.5, maxValue: 3.0 },
    },
    visualEffectId: 'glow_gold',
    soundEffectId: 'roll_royal',
    skinId: 'skin_gold_emperor',
  },
];

const generateLuxuryDiceItems = (): DiceItem[] => {
  const list = [...INITIAL_STATIC_ITEMS];
  
  const rarities: ("COMMON" | "RARE" | "EPIC" | "LEGENDARY")[] = ["COMMON", "RARE", "EPIC", "LEGENDARY"];
  const colorNames = ["Diamond", "Ruby", "Sapphire", "Emerald", "Platinum", "Gold", "Obsidian", "Amethyst", "Opal", "Bronze", "Silver", "Amber", "Quartz", "Jade", "Crystal", "Cosmic", "Neon", "Cyber", "Royal", "Shadow", "Solstice", "Nebula", "Galaxy", "Solar", "Lunar", "Stellar", "Astral", "Chrono", "Aero", "Aqua", "Pyro", "Terra", "Volt", "Plasma", "Glitch", "Retro", "Steampunk", "Victorian", "Gothic", "Ancient", "Prismatic", "Glitter", "Spectre", "Void", "Ethereal", "Mythic", "Divine", "Celestial"];
  const designStyles = ["Luxury", "Royal", "Elite", "Grand", "Imperial", "Majestic", "Emperor", "King", "Queen", "Knight", "Lord", "Crown", "Jeweled", "Gilded", "Sparkling", "Glowing", "Fiery", "Frozen", "Electric", "Magnetic", "Windstorm", "Abyssal", "Divine", "Mystic", "Enchanted", "Cursed", "Blessed", "Holographic", "Gradient", "Metallic", "Chrome", "Glossy", "Matte", "Carbon", "Forged", "Damascus", "Marble", "Wooden", "Bone", "Glass", "Crystaline", "Glittery", "Runic", "Tribal", "Abstract", "Symmetric", "Ornate", "Classic", "Modern", "Futuristic"];

  for (let i = 1; i <= 2910; i++) {
    const color = colorNames[i % colorNames.length];
    const style = designStyles[(i >> 1) % designStyles.length];
    const rarity = rarities[i % rarities.length];
    
    let cost: { coins?: number; gems?: number } = {};
    if (rarity === "COMMON") {
      cost = { coins: 1000 + (i % 5) * 500 };
    } else if (rarity === "RARE") {
      cost = { coins: 3000 + (i % 5) * 1000 };
    } else if (rarity === "EPIC") {
      cost = { gems: 50 + (i % 5) * 20 };
    } else {
      cost = { gems: 150 + (i % 5) * 50 };
    }

    list.push({
      id: `dice_luxury_${i}`,
      name: `${color} ${style} Dice #${i}`,
      description: `A masterfully crafted ${rarity.toLowerCase()} luxury dice featuring a ${color.toLowerCase()} base and ${style.toLowerCase()} ornaments.`,
      rarity,
      level: 1,
      maxLevel: rarity === "COMMON" ? 5 : rarity === "RARE" ? 10 : rarity === "EPIC" ? 12 : 15,
      isUnlocked: false,
      isEquipped: false,
      isFavorite: false,
      cost,
      attributes: {
        rollModifier: { name: 'Six Chance', value: 16.6 + (i % 10) * 0.4, maxValue: 20 + (i % 10) * 0.8 },
        goldBonus: { name: 'Gold Multiplier', value: 1.0 + (i % 10) * 0.1, maxValue: 1.5 + (i % 10) * 0.2 },
        xpBonus: { name: 'XP Multiplier', value: 1.0 + (i % 10) * 0.1, maxValue: 1.5 + (i % 10) * 0.2 },
      },
      visualEffectId: `glow_${color.toLowerCase()}`,
      soundEffectId: 'roll_royal',
      skinId: `skin_${color.toLowerCase()}`,
    });
  }

  return list;
};

export const INITIAL_DICE_ITEMS: DiceItem[] = generateLuxuryDiceItems();
