import React from 'react';

interface BottomNavigationProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  onOpenProfileSettings?: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeNav,
  onNavChange,
  onOpenProfileSettings,
}) => {
  return (
    <footer className="w-full h-[72px] px-4 bg-slate-950/95 border-t-2 border-purple-500/60 flex items-center justify-around z-30 backdrop-blur-2xl shadow-[0_-4px_24px_rgba(139,92,246,0.2)] rounded-t-2xl flex-shrink-0">
      {/* SHOP */}
      <button
        onClick={() => onNavChange('shop')}
        className={`relative flex flex-col items-center transition-all ${
          activeNav === 'shop' ? 'text-amber-400 scale-110 font-black' : 'text-slate-400 hover:text-white'
        }`}
      >
        <img src="/assets/images/icons/luxury_chest.png" className="w-7 h-7 object-contain hover:scale-110 transition-transform" alt="Shop" />
        <span className="absolute -top-1 -right-2 bg-rose-600 text-white font-black text-[8px] px-1 rounded-full border border-slate-950 shadow-md">
          NEW
        </span>
        <span className="text-[10px] font-black mt-0.5 uppercase tracking-wider">SHOP</span>
      </button>

      {/* FRIENDS */}
      <button
        onClick={() => onNavChange('friends')}
        className={`relative flex flex-col items-center transition-all ${
          activeNav === 'friends' ? 'text-amber-400 scale-110 font-black' : 'text-slate-400 hover:text-white'
        }`}
      >
        <span className="text-2xl">👥</span>
        {/* Glowing Green Online Indicator Dot */}
        <span className="absolute top-0.5 right-4 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-slate-950 shadow-md">
          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
        </span>
        <span className="text-[10px] font-black mt-0.5 uppercase tracking-wider">FRIENDS</span>
      </button>

      {/* HOME (Large Central Highlighted Icon) */}
      <button
        onClick={() => onNavChange('home')}
        className="relative -top-5 flex flex-col items-center transition-all group z-40"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border-4 border-slate-950 flex items-center justify-center text-3xl text-slate-950 shadow-2xl group-hover:scale-110 transition-transform animate-pulse">
          🏠
        </div>
        <span className="text-[11px] font-black text-amber-400 mt-0.5 uppercase tracking-widest drop-shadow">
          HOME
        </span>
      </button>

      {/* REWARDS */}
      <button
        onClick={() => onNavChange('rewards')}
        className={`relative flex flex-col items-center transition-all ${
          activeNav === 'rewards' ? 'text-amber-400 scale-110 font-black' : 'text-slate-400 hover:text-white'
        }`}
      >
        <span className="text-2xl">🎁</span>
        <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-black text-[9px] w-4 h-4 rounded-full border border-slate-950 flex items-center justify-center shadow">
          2
        </span>
        <span className="text-[10px] font-black mt-0.5 uppercase tracking-wider">REWARDS</span>
      </button>

      {/* PROFILE */}
      <button
        onClick={() => {
          onNavChange('profile');
          onOpenProfileSettings?.();
        }}
        className={`flex flex-col items-center transition-all ${
          activeNav === 'profile' ? 'text-amber-400 scale-110 font-black' : 'text-slate-400 hover:text-white'
        }`}
      >
        <span className="text-2xl">👤</span>
        <span className="text-[10px] font-black mt-0.5 uppercase tracking-wider">PROFILE</span>
      </button>
    </footer>
  );
};
