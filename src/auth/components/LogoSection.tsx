import React from 'react';

export const LogoSection: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center my-6 z-10 select-none relative">
      {/* Crown Crest Header with Golden Glow */}
      <div className="relative flex items-center justify-center mb-1">
        <div className="absolute inset-0 bg-yellow-500/30 blur-2xl rounded-full w-24 h-24 -top-6 -left-8 animate-pulse"></div>
        <span className="text-6xl drop-shadow-[0_0_25px_rgba(255,215,0,1)] animate-bounce relative z-10">
          👑
        </span>
      </div>

      {/* Golden Gradient Shield/Badge for LUDO LEGENDS */}
      <div className="relative px-8 py-3 bg-gradient-to-b from-yellow-300 via-yellow-500 to-amber-700 rounded-[2rem] border-[3px] border-yellow-200 shadow-[0_10px_40px_rgba(255,193,7,0.5)] text-center transform transition-all hover:scale-105">
        {/* Inner Dark Shield/Background */}
        <div className="absolute inset-[3px] bg-gradient-to-b from-[#2A0B34] to-[#12061F] rounded-[1.7rem] z-0"></div>
        
        {/* Logo Text */}
        <div className="relative z-10 flex flex-col items-center">
          <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] filter">
            LUDO
          </h1>
          <h2 className="text-2xl font-extrabold tracking-[0.3em] bg-gradient-to-r from-amber-200 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] -mt-1">
            LEGENDS
          </h2>
        </div>

        {/* Tagline Pill Badge */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-slate-900 via-[#3A103A] to-slate-900 px-4 py-1 rounded-full border border-amber-400/50 shadow-lg min-w-max z-20">
          <span className="text-[10px] font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400 uppercase drop-shadow">
            PLAY • WIN • BE THE LEGEND
          </span>
        </div>
      </div>
    </div>
  );
};
