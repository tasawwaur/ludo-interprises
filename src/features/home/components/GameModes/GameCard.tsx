import React from 'react';

interface GameCardProps {
  title: string;
  subtitle: string;
  icon: string;
  bgClass: string;
  borderColor: string;
  accentColor: string;
  onClick: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({
  title,
  subtitle,
  icon,
  bgClass,
  borderColor,
  accentColor,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`group relative h-[110px] rounded-[24px] ${bgClass} border-[1.5px] ${borderColor}/60 p-3 flex flex-col justify-between shadow-[0_15px_30px_rgba(0,0,0,0.3)] hover:scale-[1.03] active:scale-95 transition-all overflow-hidden cursor-pointer text-left`}
    >
      {/* Decorative Glow */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-125 transition-transform"></div>

      <div className="flex flex-col gap-1 z-10">
        <span className="text-2xl drop-shadow-md">
          {icon}
        </span>
        <span className="text-[13px] font-black text-white tracking-wide uppercase drop-shadow">
          {title}
        </span>
        <span className={`text-[10px] font-bold ${accentColor} leading-none`}>
          {subtitle}
        </span>
      </div>

      <div className="absolute bottom-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:bg-gray-100 transition-colors z-10">
        <span className="text-[10px] ml-[2px]">▶</span>
      </div>
    </button>
  );
};
