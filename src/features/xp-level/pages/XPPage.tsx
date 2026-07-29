import React, { useState } from 'react';
import { LudoPageBackground } from '../../../components/effects/LudoPageBackground';
import { XPOverview } from '../sections/XPOverview';
import { ProgressSection } from '../sections/ProgressSection';
import { RewardsSection } from '../sections/RewardsSection';
import { HistorySection } from '../sections/HistorySection';
import { LevelUpAnimation } from '../components/Effects/LevelUpAnimation';
import { useLevel } from '../hooks/useLevel';

interface XPPageProps {
  onBack?: () => void;
  initialTab?: 'OVERVIEW' | 'STATS' | 'MILESTONES' | 'LOGS';
}

export const XPPage: React.FC<XPPageProps> = ({ onBack, initialTab = 'OVERVIEW' }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STATS' | 'MILESTONES' | 'LOGS'>(initialTab);
  const { showLevelUpModal, levelUpFrom, levelUpTo, dismissLevelUpModal } = useLevel();

  const renderContent = () => {
    switch (activeTab) {
      case 'OVERVIEW':
        return (
          <XPOverview
            onOpenHistory={() => setActiveTab('LOGS')}
            onOpenRewards={() => setActiveTab('MILESTONES')}
            onOpenProgress={() => setActiveTab('STATS')}
          />
        );
      case 'STATS':
        return <ProgressSection />;
      case 'MILESTONES':
        return <RewardsSection />;
      case 'LOGS':
        return <HistorySection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* Ornate Watermarked Background overlay */}
      <LudoPageBackground variant="rewards" />

      {/* Level Up celebratory popup modal */}
      {showLevelUpModal && (
        <LevelUpAnimation
          levelFrom={levelUpFrom}
          levelTo={levelUpTo}
          onDismiss={dismissLevelUpModal}
        />
      )}

      <div className="w-full max-w-[430px] h-screen flex flex-col relative z-10 px-3 py-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-lg hover:bg-black/60 hover:scale-105 active:scale-95 transition-transform"
          >
            ❮
          </button>
          <h1 className="text-lg font-black tracking-widest bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase glow-amber-text">
            XP & PROGRESSION
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Tab Controls Bar */}
        <div className="flex bg-black/60 p-1.5 rounded-2xl border border-purple-500/30 mb-4 shadow-2xl">
          {([
            { id: 'OVERVIEW', label: 'Overview' },
            { id: 'STATS', label: 'Stats' },
            { id: 'MILESTONES', label: 'Rewards' },
            { id: 'LOGS', label: 'Logs' },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-xl text-[9px] font-black tracking-wider uppercase transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 shadow-lg border border-yellow-200'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Container Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6">{renderContent()}</div>
      </div>
    </div>
  );
};
export default XPPage;
