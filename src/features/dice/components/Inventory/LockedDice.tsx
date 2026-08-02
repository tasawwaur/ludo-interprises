import React, { useState } from 'react';
import { DiceItem } from '../../types/dice.types';
import DiceCard from '../DiceCard';

interface LockedDiceProps {
  diceItems: DiceItem[];
  onUnlock?: (id: string) => void;
  userCoins: number;
}

export const LockedDice: React.FC<LockedDiceProps> = ({ diceItems, onUnlock, userCoins }) => {
  const [limit, setLimit] = useState(30);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {diceItems.slice(0, limit).map((dice) => (
          <DiceCard
            key={dice.id}
            dice={dice}
            isEquipped={false}
            onUnlock={() => onUnlock?.(dice.id)}
            userCoins={userCoins}
          />
        ))}
      </div>
      {diceItems.length > limit && (
        <button
          onClick={() => setLimit((prev) => prev + 30)}
          className="w-full py-3 bg-gradient-to-r from-purple-800 to-indigo-900 hover:brightness-110 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider rounded-xl border border-purple-500/30 transition-all active:scale-[0.98]"
        >
          Load More (+30 of {diceItems.length - limit} remaining)
        </button>
      )}
    </div>
  );
};
export default LockedDice;
