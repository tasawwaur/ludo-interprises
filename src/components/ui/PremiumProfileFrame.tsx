import React from 'react';
import { getFrameStyle } from '../../utils/cosmeticStyles';

interface PremiumProfileFrameProps {
  frameId: string;
  className?: string;
  children: React.ReactNode;
}

export const PremiumProfileFrame: React.FC<PremiumProfileFrameProps> = ({
  frameId,
  className = '',
  children
}) => {
  const style = getFrameStyle(frameId);
  const isDefault = frameId === 'frame_default';

  return (
    <div className={`relative p-[4px] rounded-full flex items-center justify-center ${className}`}>
      {/* Outer Glow & Border Frame Layer */}
      <div
        className={`absolute inset-0 rounded-full border-2 ${style.borderClass} ${style.shadowClass} ${style.animationClass}`}
        style={{
          boxShadow: style.glowColor !== 'transparent' ? `0 0 12px 3px ${style.glowColor}` : undefined
        }}
      />
      
      {/* Avatar cutout container */}
      <div className="relative rounded-full overflow-hidden bg-slate-950 z-10 w-full h-full flex items-center justify-center">
        {children}
      </div>

      {/* Decorative Ornaments overlays */}
      {!isDefault && style.cornerStyle && (
        <>
          {/* Top Crown indicator */}
          {style.cornerStyle.includes('before:content-["👑"]') && (
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 text-[13px] animate-bounce filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]">
              👑
            </span>
          )}
          {/* Bottom fire indicator */}
          {style.cornerStyle.includes('after:content-["🔥"]') && (
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-30 text-[11px] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]">
              🔥
            </span>
          )}
          {/* Top-Right snow indicator */}
          {style.cornerStyle.includes('after:content-["❄️"]') && (
            <span className="absolute -top-2.5 -right-2 z-30 text-[11px] filter drop-shadow-[0_0_6px_rgba(59,130,246,0.9)] animate-pulse">
              ❄️
            </span>
          )}
          {/* Top-Right lightning indicator */}
          {style.cornerStyle.includes('after:content-["⚡"]') && (
            <span className="absolute -top-2.5 -right-2 z-30 text-[12px] filter drop-shadow-[0_0_8px_rgba(236,72,153,0.9)] animate-bounce">
              ⚡
            </span>
          )}
          {/* Bottom-Right skull indicator */}
          {style.cornerStyle.includes('after:content-["💀"]') && (
            <span className="absolute -bottom-2 -right-2 z-30 text-[10px] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              💀
            </span>
          )}
          {/* Top-Left star sparkles */}
          {style.cornerStyle.includes('after:content-["✦"]') && (
            <span className="absolute -top-2 -left-2.5 z-30 text-[9px] text-yellow-200 animate-ping">
              ✦
            </span>
          )}
        </>
      )}
    </div>
  );
};
export default PremiumProfileFrame;
