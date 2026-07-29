import React from 'react';
import { DiceItem } from '../types/dice.types';
import DiceCard from '../components/DiceCard';

interface FeaturedDiceProps {
  diceItems: DiceItem[];
  equippedId: string;
  onEquip?: (id: string) => void;
  onUnlock?: (id: string) => void;
  userCoins: number;
}

export const FeaturedDice: React.FC<FeaturedDiceProps> = ({
  diceItems,
  equippedId,
  onEquip,
  onUnlock,
  userCoins,
}) => {
  // Take first legendary or epic item as featured
  const featuredItem = diceItems.find((d) => d.rarity === 'LEGENDARY' || d.rarity === 'EPIC') || diceItems[0];

  return (
    <div className="bg-purple-950/60 border border-purple-800/40 rounded-3xl p-4 flex flex-col gap-3 shadow-md relative overflow-hidden">
      {/* Background Ornate Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl bg-amber-500/10 pointer-events-none"></div>

      <span className="text-[9px] text-amber-300 font-black uppercase tracking-wider block">Featured Dice of the Month</span>
      
      <DiceCard
        dice={featuredItem}
        isEquipped={featuredItem.id === equippedId}
        onEquip={() => onEquip?.(featuredItem.id)}
        onUnlock={() => onUnlock?.(featuredItem.id)}
        userCoins={userCoins}
      />
    </div>
  );
};
export default FeaturedDice;
