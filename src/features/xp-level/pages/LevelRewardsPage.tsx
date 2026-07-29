import React from 'react';
import { LudoPageBackground } from '../../../components/effects/LudoPageBackground';
import { RewardsSection } from '../sections/RewardsSection';

interface LevelRewardsPageProps {
  onBack?: () => void;
}

export const LevelRewardsPage: React.FC<LevelRewardsPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      <LudoPageBackground variant="rewards" />

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
            LEVEL MILESTONES
          </h1>
          <div className="w-9 h-9"></div>
        </div>

        {/* Rewards grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-6">
          <RewardsSection />
        </div>
      </div>
    </div>
  );
};
export default LevelRewardsPage;
