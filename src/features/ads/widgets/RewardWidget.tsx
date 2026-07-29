import React from 'react';

interface RewardWidgetProps {
  onClick?: () => void;
}

export const RewardWidget: React.FC<RewardWidgetProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-purple-950/60 border border-purple-800/40 rounded-2xl p-3 flex items-center justify-between hover:scale-[1.01] active:scale-95 transition-transform"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl animate-bounce">🎁</span>
        <div className="flex flex-col">
          <span className="text-[10px] text-white font-black leading-tight">Free Rewards Lobby</span>
          <span className="text-[8px] text-amber-300 font-bold mt-0.5">Claim free coins & gems by watching ads!</span>
        </div>
      </div>
      <span className="text-xs text-amber-400">➔</span>
    </button>
  );
};
export default RewardWidget;
