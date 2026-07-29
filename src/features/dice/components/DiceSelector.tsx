import React from 'react';
import { DiceItem } from '../types/dice.types';

interface DiceSelectorProps {
  diceItems: DiceItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const DiceSelector: React.FC<DiceSelectorProps> = ({ diceItems, selectedId, onSelect }) => {
  return (
    <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
      {diceItems.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`flex-shrink-0 p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 ${
              isSelected
                ? 'bg-purple-900/60 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                : 'bg-purple-950/40 border-purple-900/20 hover:border-purple-800'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 flex items-center justify-center text-2xl shadow-inner">
              🎲
            </div>
            <span className="text-[8px] font-black text-white max-w-[56px] truncate">{item.name}</span>
          </button>
        );
      })}
    </div>
  );
};
export default DiceSelector;
