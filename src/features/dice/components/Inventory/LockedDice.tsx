import React from 'react';
import { DiceItem } from '../../types/dice.types';
import DiceCard from '../DiceCard';

interface LockedDiceProps {
  diceItems: DiceItem[];
  onUnlock?: (id: string) => void;
  userCoins: number;
}

export const LockedDice: React.FC<LockedDiceProps> = ({ diceItems, onUnlock, userCoins }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {diceItems.map((dice) => (
        <DiceCard
          key={dice.id}
          dice={dice}
          isEquipped={false}
          onUnlock={() => onUnlock?.(dice.id)}
          userCoins={userCoins}
        />
      ))}
    </div>
  );
};
export default LockedDice;
