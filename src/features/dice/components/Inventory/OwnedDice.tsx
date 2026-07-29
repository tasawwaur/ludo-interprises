import React from 'react';
import { DiceItem } from '../../types/dice.types';
import DiceCard from '../DiceCard';

interface OwnedDiceProps {
  diceItems: DiceItem[];
  equippedId: string;
  onEquip?: (id: string) => void;
  onUpgrade?: (id: string) => void;
  onFavorite?: (id: string) => void;
  userCoins: number;
}

export const OwnedDice: React.FC<OwnedDiceProps> = ({
  diceItems,
  equippedId,
  onEquip,
  onUpgrade,
  onFavorite,
  userCoins,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {diceItems.map((dice) => (
        <DiceCard
          key={dice.id}
          dice={dice}
          isEquipped={dice.id === equippedId}
          onEquip={() => onEquip?.(dice.id)}
          onUpgrade={() => onUpgrade?.(dice.id)}
          onFavorite={() => onFavorite?.(dice.id)}
          userCoins={userCoins}
        />
      ))}
    </div>
  );
};
export default OwnedDice;
