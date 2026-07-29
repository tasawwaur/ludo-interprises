import React, { useState, useEffect } from 'react';

interface RollAnimationProps {
  isRolling: boolean;
  value: number | null;
}

export const RollAnimation: React.FC<RollAnimationProps> = ({ isRolling, value }) => {
  const [tempFace, setTempFace] = useState<number>(1);

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

  const renderDiceUnicode = (val: number): string => {
    switch (val) {
      case 1: return '⚀';
      case 2: return '⚁';
      case 3: return '⚂';
      case 4: return '⚃';
      case 5: return '⚄';
      case 6: return '⚅';
      default: return '🎲';
    }
  };

  if (isRolling) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFD700]/20 via-[#4B0082]/60 to-[#FFD700]/20 border-2 border-amber-400 flex items-center justify-center text-5xl shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-bounce select-none">
          {renderDiceUnicode(tempFace)}
        </div>
      </div>
    );
  }

  if (value === null) return null;

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-800 to-indigo-900 border-2 border-yellow-400 flex flex-col items-center justify-center shadow-2xl relative animate-in zoom-in duration-300 select-none">
        {value === 6 && (
          <span className="absolute -top-3 -right-2.5 text-lg animate-bounce">👑</span>
        )}
        <span className="text-4xl text-amber-200 font-bold leading-none">{renderDiceUnicode(value)}</span>
        <span className="text-[8px] font-black text-amber-400 tracking-widest mt-0.5">{value}</span>
      </div>
    </div>
  );
};
export default RollAnimation;
