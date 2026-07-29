import React from 'react';
import { useDice } from '../hooks/useDice';

interface DiceWidgetProps {
  onClick?: () => void;
}

export const DiceWidget: React.FC<DiceWidgetProps> = ({ onClick }) => {
  const { equippedDice } = useDice();

  if (!equippedDice) return null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-purple-950/60 border border-purple-800/40 rounded-2xl p-3 flex items-center justify-between hover:scale-[1.01] active:scale-95 transition-transform"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-amber-500/20 flex items-center justify-center text-2xl shadow-inner">
          🎲
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-white font-black leading-tight">{equippedDice.name}</span>
          <span className="text-[8px] text-amber-300 font-bold mt-0.5">Six Chance: {equippedDice.attributes.rollModifier.value}%</span>
        </div>
      </div>
      <span className="text-xs text-amber-400">➔</span>
    </button>
  );
};
export default DiceWidget;
