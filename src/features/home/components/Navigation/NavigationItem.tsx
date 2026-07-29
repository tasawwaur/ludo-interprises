import React from 'react';

interface NavigationItemProps {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  isHome?: boolean;
  isActive: boolean;
  onClick: () => void;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  icon,
  badge,
  isHome,
  isActive,
  onClick,
}) => {
  if (isHome) {
    return (
      <button
        onClick={onClick}
        className="relative -top-5 flex flex-col items-center transition-all group z-40 cursor-pointer"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#ffd54f] via-amber-500 to-[#ffc107] border-4 border-slate-950 flex items-center justify-center text-3xl text-slate-950 shadow-2xl group-hover:scale-110 transition-transform animate-pulse">
          {icon}
        </div>
        <span className="text-[11px] font-black text-amber-400 mt-0.5 uppercase tracking-widest drop-shadow">
          {label}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center transition-all cursor-pointer ${
        isActive ? 'scale-110 font-black' : 'text-gray-400 hover:text-white'
      }`}
    >
      <div className="relative flex flex-col items-center">
        {isActive && (
          <div className="absolute -top-6 w-8 h-8 bg-yellow-400/30 rounded-full blur-md"></div>
        )}
        <span className={`text-2xl drop-shadow ${isActive ? 'text-yellow-400 grayscale-0' : 'grayscale'}`}>{icon}</span>
        {badge && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white font-black text-[9px] px-1.5 rounded-full border border-black shadow">
            {badge}
          </span>
        )}
      </div>
      <span className={`text-[10px] font-black mt-1 uppercase tracking-wider ${isActive ? 'text-yellow-400' : 'text-gray-400'}`}>{label}</span>
    </button>
  );
};
