import React from 'react';

interface HeroCardProps {
  onSelectMode: (modeKey: string) => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({ onSelectMode }) => {
  return (
    <div className="w-full my-1 z-10 px-1">
      <button
        onClick={() => onSelectMode('2P Classic')}
        className="group relative w-full h-[140px] rounded-3xl bg-gradient-to-br from-[#ffc107] via-amber-500 to-[#ff9800] border border-yellow-200/50 flex items-center shadow-[0_15px_40px_rgba(255,152,0,0.4)] hover:scale-[1.02] active:scale-95 transition-all overflow-hidden cursor-pointer"
      >
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>

        {/* Left Side: Ludo Board Illustration */}
        <div className="relative z-10 w-[45%] h-full flex items-center justify-center pl-2">
          <div className="w-24 h-24 bg-[#12061f]/90 rounded-2xl border-2 border-yellow-300 p-1.5 shadow-xl rotate-[-5deg] group-hover:rotate-0 transition-transform">
            <div className="w-full h-full grid grid-cols-2 gap-1 bg-black/50 p-1 rounded-xl">
              <div className="bg-[#00d26a] rounded-lg shadow-inner flex items-center justify-center">♙</div>
              <div className="bg-[#ffc107] rounded-lg shadow-inner flex items-center justify-center">♙</div>
              <div className="bg-[#ef4444] rounded-lg shadow-inner flex items-center justify-center">♙</div>
              <div className="bg-[#3b82f6] rounded-lg shadow-inner flex items-center justify-center">♙</div>
            </div>
            <div className="absolute -top-3 -right-3 text-3xl drop-shadow-lg animate-bounce">🎲</div>
          </div>
        </div>

        {/* Right Side: Text & Button */}
        <div className="relative z-10 w-[55%] flex items-center justify-between h-full pr-4">
          <div className="flex flex-col text-left pl-2">
            <h2 className="text-3xl font-black text-white tracking-wider drop-shadow-md leading-tight">
              2 PLAYER
            </h2>
            <p className="text-sm font-bold text-yellow-100 tracking-wide drop-shadow">
              1 vs 1
            </p>
          </div>

          {/* Circular Play Button */}
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-100 text-amber-500 text-xl pl-1 group-hover:bg-amber-100 transition-colors">
            ▶
          </div>
        </div>
      </button>
    </div>
  );
};
