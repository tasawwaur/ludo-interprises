import React, { useState } from 'react';
import { DiceItem } from '../types/dice.types';
import DiceCard from '../components/DiceCard';

interface DiceCollectionProps {
  diceItems: DiceItem[];
  equippedId: string;
  onEquip?: (id: string) => void;
  onUnlock?: (id: string) => void;
  onUpgrade?: (id: string) => void;
  userCoins: number;
}

export const DiceCollection: React.FC<DiceCollectionProps> = ({
  diceItems,
  equippedId,
  onEquip,
  onUnlock,
  onUpgrade,
  userCoins,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'OWNED' | 'LOCKED'>('ALL');
  const [limit, setLimit] = useState(30);

  const filteredItems = diceItems.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'OWNED') return item.isUnlocked;
    if (filter === 'LOCKED') return !item.isUnlocked;
    return true;
  });

  const handleFilterChange = (tab: 'ALL' | 'OWNED' | 'LOCKED') => {
    setFilter(tab);
    setLimit(30);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Filters bar */}
      <div className="flex bg-black/40 border border-purple-800/30 rounded-2xl p-1 shadow-inner">
        {(['ALL', 'OWNED', 'LOCKED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleFilterChange(tab)}
            className={`flex-1 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
              filter === tab
                ? 'bg-purple-700 text-white shadow-md'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Dice Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {filteredItems.slice(0, limit).map((dice) => (
          <DiceCard
            key={dice.id}
            dice={dice}
            isEquipped={dice.id === equippedId}
            onEquip={() => onEquip?.(dice.id)}
            onUnlock={() => onUnlock?.(dice.id)}
            onUpgrade={() => onUpgrade?.(dice.id)}
            userCoins={userCoins}
          />
        ))}
      </div>

      {filteredItems.length > limit && (
        <button
          onClick={() => setLimit((prev) => prev + 30)}
          className="w-full py-2.5 bg-purple-900/60 hover:bg-purple-800/80 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider rounded-xl border border-purple-500/30 transition-all active:scale-[0.98] mt-2"
        >
          Load More (+30 of {filteredItems.length - limit} remaining)
        </button>
      )}
    </div>
  );
};
export default DiceCollection;
