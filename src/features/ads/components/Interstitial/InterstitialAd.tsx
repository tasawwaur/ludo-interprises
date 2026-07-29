import React from 'react';

interface InterstitialAdProps {
  isPlaying: boolean;
}

export const InterstitialAd: React.FC<InterstitialAdProps> = ({ isPlaying }) => {
  if (!isPlaying) return null;

  return (
    <div className="absolute inset-0 z-[120] bg-black flex flex-col items-center justify-center text-white select-none animate-in fade-in duration-300">
      <div className="text-center flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-black text-amber-200 uppercase tracking-widest block mt-2 animate-pulse">
          LUDO ADVERTISEMENT
        </span>
        <span className="text-[9px] text-gray-500 italic block">Sponsored Content</span>
      </div>
    </div>
  );
};
export default InterstitialAd;
