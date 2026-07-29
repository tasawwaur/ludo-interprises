import React from 'react';
import { RollResult } from '../../types/roll.types';

interface RollHistoryProps {
  history: RollResult[];
}

export const RollHistory: React.FC<RollHistoryProps> = ({ history }) => {
  return (
    <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto no-scrollbar">
      {history.map((h, i) => (
        <div
          key={i}
          className="flex justify-between items-center p-2.5 bg-purple-950/40 border border-purple-900/30 rounded-xl"
        >
          <div className="flex flex-col">
            <span className="text-[10px] text-white font-black">Roll #{history.length - i}</span>
            <span className="text-[8px] text-gray-400 font-medium">
              {new Date(h.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {h.modifiersApplied.map((mod, idx) => (
              <span key={idx} className="text-[8px] text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                +{mod.value}% {mod.name}
              </span>
            ))}
            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
              h.isSix 
                ? 'bg-amber-400 text-purple-950 shadow-[0_0_8px_rgba(251,191,36,0.5)] border border-yellow-200' 
                : 'bg-purple-900 text-purple-200 border border-purple-800'
            }`}>
              {h.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
export default RollHistory;
