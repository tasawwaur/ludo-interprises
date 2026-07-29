import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface LevelUpAnimationProps {
  levelFrom: number;
  levelTo: number;
  onDismiss: () => void;
}

export const LevelUpAnimation: React.FC<LevelUpAnimationProps> = ({
  levelFrom,
  levelTo,
  onDismiss,
}) => {
  useEffect(() => {
    // Launch premium celebratory confetti
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500', '#FF8C00'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700', '#FFA500', '#FF8C00'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="absolute inset-0 z-[120] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white select-none animate-fade-in animate-in duration-300">
      {/* Glow Orbs */}
      <div className="absolute top-1/3 w-72 h-72 rounded-full blur-3xl bg-yellow-500/20 animate-pulse-soft"></div>
      
      {/* Confetti container / badge area */}
      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        <span className="text-4xl animate-bounce">👑</span>
        <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent uppercase tracking-widest drop-shadow">
          LEVEL UP!
        </h2>
        <p className="text-xs text-purple-200 uppercase tracking-widest">Congratulations Champion</p>

        {/* Level Progression Indicator */}
        <div className="flex items-center gap-6 my-6">
          <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-lg font-black text-slate-400">
            {levelFrom}
          </div>
          <span className="text-2xl text-amber-400">➔</span>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-4 border-yellow-200 flex items-center justify-center text-3xl font-black text-purple-950 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-pulse">
            {levelTo}
          </div>
        </div>

        <p className="text-[10px] text-purple-300 italic max-w-[240px]">
          New quests, board layouts, and exclusive matches are now unlocked!
        </p>

        <button
          onClick={onDismiss}
          className="mt-8 px-8 py-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all border border-yellow-200"
        >
          AWESOME
        </button>
      </div>
    </div>
  );
};
export default LevelUpAnimation;
