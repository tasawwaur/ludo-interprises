import React from 'react';
import { RollStats } from '../types/roll.types';
import { formatPercentage } from '../utils/formatter';

interface DiceHistoryProps {
  stats: RollStats;
}

export const DiceHistory: React.FC<DiceHistoryProps> = ({ stats }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Stats Cards */}
      <div className="bg-purple-950/60 border-2 border-purple-500/30 rounded-3xl p-5 flex flex-col gap-4 shadow-2xl relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[1px]"></div>
        
        <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider block">Roll Telemetry</span>

        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 bg-black/35 rounded-xl border border-purple-900/30 flex flex-col items-center text-center">
            <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Total Rolls</span>
            <span className="text-sm font-black text-white mt-1">{stats.totalRolls}</span>
          </div>
          <div className="p-3 bg-black/35 rounded-xl border border-purple-900/30 flex flex-col items-center text-center">
            <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Sixes Rolled</span>
            <span className="text-sm font-black text-amber-400 mt-1">{stats.sixCount}</span>
          </div>
          <div className="p-3 bg-black/35 rounded-xl border border-purple-900/30 flex flex-col items-center text-center">
            <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Average Value</span>
            <span className="text-sm font-black text-teal-400 mt-1">{stats.averageValue}</span>
          </div>
        </div>

        {/* Frequency distributions graph bar charts */}
        <div className="mt-2.5">
          <span className="text-[9px] font-black text-purple-200 uppercase tracking-wider mb-3 block">Number Frequency Distribution</span>
          <div className="flex flex-col gap-2.5 bg-black/30 p-4 rounded-2xl border border-purple-900/20 shadow-inner">
            {[1, 2, 3, 4, 5, 6].map((num) => {
              const frequency = stats.frequencyDistribution[num] || 0;
              const percent = stats.totalRolls > 0 ? Math.round((frequency / stats.totalRolls) * 100) : 0;
              return (
                <div key={num} className="flex items-center gap-3">
                  <span className="text-xs font-black text-white w-2 font-mono">{num}</span>
                  <div className="flex-1 h-3 bg-purple-950/75 rounded-full border border-purple-900/40 p-[1px] overflow-hidden">
                    <div
                      style={{ width: `${Math.max(4, percent)}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        num === 6 
                          ? 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_6px_rgba(251,191,36,0.6)]' 
                          : 'bg-purple-600'
                      }`}
                    />
                  </div>
                  <span className="text-[9px] font-black text-purple-300 w-10 text-right">{frequency} ({percent}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DiceHistory;
