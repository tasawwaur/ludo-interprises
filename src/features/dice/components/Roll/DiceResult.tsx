import React from 'react';

interface DiceResultProps {
  value: number | null;
}

export const DiceResult: React.FC<DiceResultProps> = ({ value }) => {
  if (value === null) return null;

  return (
    <div className="text-center my-3 animate-fade-in">
      <span className="text-[10px] text-purple-200 block">Roll Result</span>
      <span className="text-xl font-black text-amber-300 font-mono tracking-widest block glow-amber-text">
        {value === 6 ? 'LUCKY SIX! 🎉' : `ROLLED A ${value}`}
      </span>
    </div>
  );
};
export default DiceResult;
