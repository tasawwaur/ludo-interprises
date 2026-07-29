import React from 'react';

interface LeftActionButtonsProps {
  onVideoClick?: () => void;
  onClubsClick?: () => void;
}

export const LeftActionButtons: React.FC<LeftActionButtonsProps> = ({ onVideoClick, onClubsClick }) => {
  return (
    <div className="flex flex-col justify-start gap-4 z-20 pt-1">
      {/* Video Rewards Floating Button */}
      <button
        onClick={onVideoClick}
        className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border-2 border-yellow-200 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all animate-bounce"
        title="Watch Bonus Video"
      >
        <span className="text-2xl">🎬</span>
        <span className="absolute -top-2 -right-2 bg-rose-600 text-white font-black text-xs w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-xl">
          6
        </span>
      </button>

      {/* Clubs / Events Floating Button */}
      <button
        onClick={onClubsClick}
        className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-rose-500 via-pink-600 to-purple-800 border-2 border-rose-200 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
        title="Clubs & Events"
      >
        <span className="text-2xl">🏆</span>
        <span className="absolute -top-2 -right-2 bg-amber-500 text-slate-950 font-black text-xs w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-xl">
          1
        </span>
      </button>
    </div>
  );
};
