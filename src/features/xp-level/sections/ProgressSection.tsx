import React from 'react';
import { useProgress } from '../hooks/useProgress';
import { useLevel } from '../hooks/useLevel';
import { LevelProgress } from '../components/Progress/LevelProgress';
import { NextLevel } from '../components/Progress/NextLevel';

export const ProgressSection: React.FC = () => {
  const { stats } = useProgress();
  const { levelState } = useLevel();

  return (
    <div className="flex flex-col gap-4">
      {/* Circle level gauge */}
      <div className="bg-purple-950/60 border-2 border-purple-500/30 rounded-3xl p-5 flex flex-col items-center gap-3 shadow-2xl relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[1px]"></div>
        
        <LevelProgress
          currentXp={levelState.currentXp}
          requiredXp={levelState.xpRequiredForNextLevel}
          level={levelState.currentLevel}
        />
        
        <NextLevel level={levelState.currentLevel} />
      </div>

      {/* Stats Summary Panel */}
      <div className="bg-purple-950/40 border border-purple-900/40 rounded-2xl p-4 flex flex-col gap-3 shadow-inner">
        <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider block">Progression Telemetry</span>
        
        <div className="grid grid-cols-2 gap-3 mt-1">
          <div className="p-3 bg-black/35 rounded-xl border border-purple-900/30 flex flex-col">
            <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Total Matches</span>
            <span className="text-sm font-black text-white mt-0.5">{stats.matchesPlayed}</span>
          </div>
          <div className="p-3 bg-black/35 rounded-xl border border-purple-900/30 flex flex-col">
            <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Matches Won</span>
            <span className="text-sm font-black text-amber-400 mt-0.5">{stats.matchesWon}</span>
          </div>
          <div className="p-3 bg-black/35 rounded-xl border border-purple-900/30 flex flex-col">
            <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Win Rate</span>
            <span className="text-sm font-black text-teal-400 mt-0.5">{stats.winRate}%</span>
          </div>
          <div className="p-3 bg-black/35 rounded-xl border border-purple-900/30 flex flex-col">
            <span className="text-[8px] text-purple-300 font-bold uppercase tracking-wider">Total XP Earned</span>
            <span className="text-sm font-black text-amber-300 mt-0.5">{stats.totalXpEarned}</span>
          </div>
        </div>

        {/* Weekly Daily XP Gains simulated chart */}
        <div className="mt-2.5">
          <span className="text-[9px] font-black text-purple-200 uppercase tracking-wider mb-2 block">Weekly XP Activity</span>
          <div className="flex items-end justify-between h-20 px-2 bg-purple-950/20 rounded-xl border border-purple-900/20 pt-4">
            {stats.dailyGains.map((dg, idx) => {
              const maxGain = Math.max(...stats.dailyGains.map((g) => g.amount), 1);
              const heightPercent = Math.max(10, Math.round((dg.amount / maxGain) * 80));
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-2.5 rounded-t-md bg-gradient-to-t from-orange-500 to-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.3)]"
                  />
                  <span className="text-[8px] font-bold text-gray-400">{dg.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProgressSection;
