import React from 'react';

interface LevelBadgeProps {
  level: number;
  size?: number; // width and height in px
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, size = 64, className = "" }) => {
  // Determine style range
  let styleName = "Bronze";
  let filter = "sepia(0.8) saturate(1.4) hue-rotate(10deg) brightness(0.85)"; // bronze
  let glowColor = "rgba(180, 110, 60, 0.4)";
  let textColor = "text-[#E7A070]";

  if (level >= 1 && level <= 20) {
    styleName = "Bronze";
    filter = "sepia(0.8) saturate(1.4) hue-rotate(10deg) brightness(0.85)";
    glowColor = "rgba(180, 110, 60, 0.4)";
    textColor = "text-[#FCD34D]"; // gold-bronze text
  } else if (level >= 21 && level <= 40) {
    styleName = "Silver";
    filter = "saturate(0) brightness(1.2)";
    glowColor = "rgba(200, 200, 200, 0.4)";
    textColor = "text-[#E2E8F0]";
  } else if (level >= 41 && level <= 60) {
    styleName = "Gold";
    filter = "sepia(1) saturate(3.5) hue-rotate(15deg) brightness(1.1)";
    glowColor = "rgba(245, 158, 11, 0.5)";
    textColor = "text-[#FCD34D]";
  } else if (level >= 61 && level <= 80) {
    styleName = "Platinum";
    filter = "saturate(0.2) brightness(1.4) hue-rotate(185deg) contrast(1.1)";
    glowColor = "rgba(99, 102, 241, 0.5)";
    textColor = "text-[#C7D2FE]";
  } else if (level >= 81 && level <= 100) {
    styleName = "Diamond";
    filter = "saturate(0.6) brightness(1.6) hue-rotate(195deg) contrast(1.2)";
    glowColor = "rgba(6, 182, 212, 0.6)";
    textColor = "text-[#93C5FD]";
  } else if (level >= 101 && level <= 120) {
    styleName = "Emerald";
    filter = "sepia(1) saturate(5) hue-rotate(95deg) brightness(1.0) contrast(1.1)";
    glowColor = "rgba(16, 185, 129, 0.6)";
    textColor = "text-[#A7F3D0]";
  } else if (level >= 121 && level <= 140) {
    styleName = "Ruby";
    filter = "sepia(1) saturate(6) hue-rotate(325deg) brightness(1.0) contrast(1.1)";
    glowColor = "rgba(239, 68, 68, 0.6)";
    textColor = "text-[#FCA5A5]";
  } else if (level >= 141 && level <= 160) {
    styleName = "Sapphire";
    filter = "sepia(0.8) saturate(5) hue-rotate(205deg) brightness(1.1) contrast(1.1)";
    glowColor = "rgba(59, 130, 246, 0.6)";
    textColor = "text-[#93C5FD]";
  } else if (level >= 161 && level <= 180) {
    styleName = "Mythic Purple";
    filter = "sepia(1) saturate(4.5) hue-rotate(265deg) brightness(0.95) contrast(1.1)";
    glowColor = "rgba(139, 92, 246, 0.7)";
    textColor = "text-[#DDD6FE]";
  } else if (level >= 181) {
    styleName = "Legendary";
    filter = "sepia(1) saturate(4.5) hue-rotate(15deg) brightness(1.15) contrast(1.2)";
    glowColor = "rgba(245, 158, 11, 0.8)";
    textColor = "text-amber-200";
  }

  const showWingsAndCrown = level >= 181;

  return (
    <div 
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ 
        width: size, 
        height: size,
        filter: `drop-shadow(0 0 6px ${glowColor})`
      }}
    >
      {/* Dynamic side wings for Legendary range */}
      {showWingsAndCrown && (
        <>
          {/* Left Wing SVG */}
          <svg className="absolute -left-[45%] w-[55%] h-[80%] fill-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] animate-pulse" viewBox="0 0 100 100">
            <path d="M90 20 C60 0 20 20 10 50 C5 65 15 80 40 85 C60 88 80 70 90 50 Z" />
            <path d="M80 35 C60 20 30 35 25 55 C20 65 30 75 50 75 Z" fill="#FBBF24" />
            <path d="M70 50 C60 40 40 50 35 62 C40 68 60 65 70 50 Z" fill="#F59E0B" />
          </svg>
          {/* Right Wing SVG */}
          <svg className="absolute -right-[45%] w-[55%] h-[80%] fill-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] scale-x-[-1] animate-pulse" viewBox="0 0 100 100">
            <path d="M90 20 C60 0 20 20 10 50 C5 65 15 80 40 85 C60 88 80 70 90 50 Z" />
            <path d="M80 35 C60 20 30 35 25 55 C20 65 30 75 50 75 Z" fill="#FBBF24" />
            <path d="M70 50 C60 40 40 50 35 62 C40 68 60 65 70 50 Z" fill="#F59E0B" />
          </svg>
        </>
      )}

      {/* Dynamic Crown for Legendary range */}
      {showWingsAndCrown && (
        <svg 
          className="absolute -top-[30%] w-[50%] h-[35%] fill-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] animate-float-mid z-30" 
          viewBox="0 0 100 100"
        >
          <path d="M10 80 L20 30 L40 60 L50 20 L60 60 L80 30 L90 80 Z" />
          <circle cx="20" cy="25" r="5" fill="#EF4444" />
          <circle cx="50" cy="15" r="6" fill="#3B82F6" />
          <circle cx="80" cy="25" r="5" fill="#EF4444" />
          <rect x="25" y="70" width="50" height="8" rx="2" fill="#FBBF24" />
        </svg>
      )}

      {/* Level Badge Base image frame */}
      <img
        src="/assets/images/icons/level_badge_base.png"
        alt={`${styleName} Level Frame`}
        className="w-full h-full object-contain pointer-events-none z-10"
        style={{ filter }}
        draggable={false}
      />

      {/* Floating sparkles for Diamond/Legendary ranges */}
      {(styleName === "Diamond" || styleName === "Legendary") && (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
          <div className="absolute top-[20%] left-[20%] w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
          <div className="absolute bottom-[25%] right-[20%] w-1 h-1 bg-cyan-200 rounded-full animate-ping [animation-delay:0.8s]"></div>
        </div>
      )}

      {/* Level Number text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <span className={`text-[8.5px] font-black uppercase tracking-widest leading-none ${textColor} opacity-80 -mt-1 scale-[0.8]`}>
          LVL
        </span>
        <span className={`text-[13px] font-black tracking-tight leading-none ${textColor} font-mono glow-text-sm`}>
          {level}
        </span>
      </div>
    </div>
  );
};

export default LevelBadge;
