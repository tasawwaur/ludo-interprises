import React, { useState, useEffect } from 'react';
import { useDiceStore } from '../../store/dice.store';
import { DiceFace } from '../../../gameplay/components/DiceFace';

interface RollAnimationProps {
  isRolling: boolean;
  value: number | null;
}

export const RollAnimation: React.FC<RollAnimationProps> = ({ isRolling, value }) => {
  const [tempFace, setTempFace] = useState<number>(1);
  const equippedDiceId = useDiceStore((s) => s.equippedDiceId);

  useEffect(() => {
    if (!isRolling) return;

    const interval = setInterval(() => {
      setTempFace((prev) => {
        let next = Math.floor(Math.random() * 6) + 1;
        while (next === prev) {
          next = Math.floor(Math.random() * 6) + 1;
        }
        return next;
      });
    }, 70);

    return () => clearInterval(interval);
  }, [isRolling]);

  if (isRolling) {
    return (
      <div className="flex items-center justify-center p-4">
        <DiceFace value={tempFace} size={64} isRolling={true} diceId={equippedDiceId} />
      </div>
    );
  }

  if (value === null) return null;

  return (
    <div className="flex items-center justify-center p-4 relative">
      {value === 6 && (
        <span className="absolute -top-1 right-2 text-lg animate-bounce z-20">👑</span>
      )}
      <DiceFace value={value} size={64} diceId={equippedDiceId} />
    </div>
  );
};
export default RollAnimation;
