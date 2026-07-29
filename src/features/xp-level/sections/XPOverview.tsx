import React, { useState } from 'react';
import { useXP } from '../hooks/useXP';
import { useLevel } from '../hooks/useLevel';
import { LevelBadge } from '../components/LevelBadge';
import { XPBar } from '../components/XPBar';
import confetti from 'canvas-confetti';

interface XPOverviewProps {
  onOpenHistory?: () => void;
  onOpenRewards?: () => void;
  onOpenProgress?: () => void;
}

export const XPOverview: React.FC<XPOverviewProps> = ({
  onOpenHistory,
  onOpenRewards,
  onOpenProgress,
}) => {
  const { quests, claimQuestReward } = useXP();
  const { levelState } = useLevel();
  const [activeQuestTab, setActiveQuestTab] = useState<'daily' | 'weekly'>('daily');

  const filteredQuests = quests.filter((q) => q.category === activeQuestTab);

  const handleClaimReward = async (questId: string) => {
    // Sparkle effect
    confetti({
      particleCount: 20,
      spread: 30,
      colors: ['#FFD700', '#FFA500'],
    });
    
    await claimQuestReward(questId);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Level Summary Header Card */}
      <div className="bg-purple-950/60 border-2 border-purple-500/30 rounded-3xl p-4 flex flex-col gap-3.5 shadow-2xl relative overflow-hidden">
        {/* Top Gold Light Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-[1px]"></div>

        <div className="flex items-center gap-3.5">
          <LevelBadge level={levelState.currentLevel} size="md" />
          <div className="flex-1">
            <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">Level {levelState.currentLevel}</span>
            <span className="text-sm font-black text-amber-200 uppercase tracking-widest block drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {levelState.title}
            </span>
          </div>
        </div>

        <XPBar currentXp={levelState.currentXp} requiredXp={levelState.xpRequiredForNextLevel} />

        {/* Small Navigation Shortcuts Grid */}
        <div className="grid grid-cols-3 gap-2 mt-1">
          <button
            onClick={onOpenProgress}
            className="py-2 px-1 rounded-xl bg-purple-900/30 border border-purple-800/30 text-[9px] font-black text-purple-200 uppercase tracking-wider hover:bg-purple-900/60 active:scale-95 transition-all text-center"
          >
            📊 STATS
          </button>
          <button
            onClick={onOpenRewards}
            className="py-2 px-1 rounded-xl bg-purple-900/30 border border-purple-800/30 text-[9px] font-black text-purple-200 uppercase tracking-wider hover:bg-purple-900/60 active:scale-95 transition-all text-center"
          >
            🎁 MILESTONES
          </button>
          <button
            onClick={onOpenHistory}
            className="py-2 px-1 rounded-xl bg-purple-900/30 border border-purple-800/30 text-[9px] font-black text-purple-200 uppercase tracking-wider hover:bg-purple-900/60 active:scale-95 transition-all text-center"
          >
            ⏳ LOGS
          </button>
        </div>
      </div>

      {/* Quests Container */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-black text-amber-200 uppercase tracking-wider">ACTIVE QUESTS</span>
          {/* Daily / Weekly Tabs */}
          <div className="flex bg-black/40 border border-purple-800/30 rounded-xl p-0.5">
            {(['daily', 'weekly'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveQuestTab(tab)}
                className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${
                  activeQuestTab === tab
                    ? 'bg-purple-700 text-white shadow-md'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Quests List */}
        <div className="flex flex-col gap-2">
          {filteredQuests.map((q) => (
            <div
              key={q.id}
              className={`flex justify-between items-center p-3 rounded-2xl border transition-all ${
                q.isClaimed
                  ? 'bg-purple-950/20 border-purple-950/20 opacity-60'
                  : q.isCompleted
                  ? 'bg-emerald-950/30 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                  : 'bg-purple-950/40 border-purple-900/40'
              }`}
            >
              <div className="flex flex-col flex-1 pr-3">
                <span className={`text-xs font-black ${q.isClaimed ? 'line-through text-gray-400' : 'text-white'}`}>
                  {q.title}
                </span>
                <span className="text-[9px] text-purple-300 italic mt-0.5">{q.description}</span>
                <span className="text-[8px] text-amber-400 font-bold mt-1">Reward: +{q.xpReward} XP</span>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                {q.isClaimed ? (
                  <span className="text-[9px] font-black text-green-400 uppercase">CLAIMED ✓</span>
                ) : q.isCompleted ? (
                  <button
                    onClick={() => handleClaimReward(q.id)}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-slate-950 text-[9px] font-black uppercase rounded-lg shadow active:scale-95 transition-all"
                  >
                    CLAIM
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-purple-200">
                      {q.currentCount} / {q.targetCount}
                    </span>
                    <span className="text-xs">⏳</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default XPOverview;
