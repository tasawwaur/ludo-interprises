import React from 'react';

interface AppOpenAdProps {
  isPlaying: boolean;
  onClose?: () => void;
}

export const AppOpenAd: React.FC<AppOpenAdProps> = ({ isPlaying, onClose }) => {
  if (!isPlaying) return null;

  return (
    <div className="absolute inset-0 z-[130] bg-[#0A0414] flex flex-col justify-between p-6 text-white animate-in fade-in duration-300">
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
        <span className="text-5xl animate-bounce">📱</span>
        <h2 className="text-lg font-black text-amber-200 uppercase tracking-widest leading-tight">LUDO STAR APPOPEN</h2>
        <span className="text-[9px] text-gray-500 italic block mt-1">Sponsored Advertisement</span>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl border border-yellow-200 hover:scale-[1.01] active:scale-95 transition-all"
      >
        CONTINUE TO LUDO GAME
      </button>
    </div>
  );
};
export default AppOpenAd;
