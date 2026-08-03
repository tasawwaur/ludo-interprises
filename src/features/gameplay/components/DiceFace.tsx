import React from 'react';
import { getDiceStyle } from '../../../utils/cosmeticStyles';

interface DiceFaceProps {
  value: number | null;
  size?: number; // Size in pixels
  isRolling?: boolean;
  diceId?: string;
}

export const DiceFace: React.FC<DiceFaceProps> = ({
  value,
  size = 48,
  isRolling = false,
  diceId = 'dice_classic'
}) => {
  const num = value && value >= 1 && value <= 6 ? value : 1;
  const style = getDiceStyle(diceId);

  // Render Dot Pips (1 to 6)
  const renderPips = (val: number) => {
    const dotColor = style.dotColor;

    switch (val) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="rounded-full shadow-inner transition-colors duration-300"
              style={{
                backgroundColor: dotColor,
                width: `${size * 0.28}px`,
                height: `${size * 0.28}px`
              }}
            ></span>
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-2">
            <span
              className="rounded-full self-start"
              style={{ backgroundColor: dotColor, width: `${size * 0.2}px`, height: `${size * 0.2}px` }}
            ></span>
            <span
              className="rounded-full self-end"
              style={{ backgroundColor: dotColor, width: `${size * 0.2}px`, height: `${size * 0.2}px` }}
            ></span>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-1.5">
            <span
              className="rounded-full self-start"
              style={{ backgroundColor: dotColor, width: `${size * 0.18}px`, height: `${size * 0.18}px` }}
            ></span>
            <span
              className="rounded-full self-center"
              style={{ backgroundColor: dotColor, width: `${size * 0.18}px`, height: `${size * 0.18}px` }}
            ></span>
            <span
              className="rounded-full self-end"
              style={{ backgroundColor: dotColor, width: `${size * 0.18}px`, height: `${size * 0.18}px` }}
            ></span>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 p-2 gap-1.5 items-center justify-items-center">
            <span
              className="rounded-full"
              style={{ backgroundColor: dotColor, width: `${size * 0.18}px`, height: `${size * 0.18}px` }}
            ></span>
            <span
              className="rounded-full"
              style={{ backgroundColor: dotColor, width: `${size * 0.18}px`, height: `${size * 0.18}px` }}
            ></span>
            <span
              className="rounded-full"
              style={{ backgroundColor: dotColor, width: `${size * 0.18}px`, height: `${size * 0.18}px` }}
            ></span>
            <span
              className="rounded-full"
              style={{ backgroundColor: dotColor, width: `${size * 0.18}px`, height: `${size * 0.18}px` }}
            ></span>
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full relative p-1.5">
            <div className="w-full h-full grid grid-cols-2 gap-2 items-center justify-items-center">
              <span
                className="rounded-full"
                style={{ backgroundColor: dotColor, width: `${size * 0.17}px`, height: `${size * 0.17}px` }}
              ></span>
              <span
                className="rounded-full"
                style={{ backgroundColor: dotColor, width: `${size * 0.17}px`, height: `${size * 0.17}px` }}
              ></span>
              <span
                className="rounded-full"
                style={{ backgroundColor: dotColor, width: `${size * 0.17}px`, height: `${size * 0.17}px` }}
              ></span>
              <span
                className="rounded-full"
                style={{ backgroundColor: dotColor, width: `${size * 0.17}px`, height: `${size * 0.17}px` }}
              ></span>
            </div>
            <span
              className="rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-inner"
              style={{
                backgroundColor: dotColor,
                width: `${size * 0.17}px`,
                height: `${size * 0.17}px`
              }}
            ></span>
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-3 p-1.5 gap-1.5 items-center justify-items-center">
            <span
              className="rounded-full"
              style={{ backgroundColor: dotColor, width: `${size * 0.15}px`, height: `${size * 0.15}px` }}
            ></span>
            <span
              className="rounded-full"
              style={{ backgroundColor: dotColor, width: `${size * 0.15}px`, height: `${size * 0.15}px` }}
            ></span>
            <span
              className="rounded-full"
              style={{ backgroundColor: dotColor, width: `${size * 0.15}px`, height: `${size * 0.15}px` }}
            ></span>
            <span
              className="rounded-full"
              style={{ backgroundColor: dotColor, width: `${size * 0.15}px`, height: `${size * 0.15}px` }}
            ></span>
            <span
              className="rounded-full"
              style={{ backgroundColor: dotColor, width: `${size * 0.15}px`, height: `${size * 0.15}px` }}
            ></span>
            <span
              className="rounded-full"
              style={{ backgroundColor: dotColor, width: `${size * 0.15}px`, height: `${size * 0.15}px` }}
            ></span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        boxShadow: style.shadowColor ? `0 6px 15px ${style.shadowColor}, inset 0 2px 4px rgba(255,255,255,0.7), inset 0 -2px 4px rgba(0,0,0,0.2)` : undefined
      }}
      className={`relative rounded-2xl bg-gradient-to-br ${style.bgGradient} border-2 ${style.borderColor} ${style.glowClass} flex items-center justify-center transition-all duration-300 ${
        isRolling ? 'animate-spin scale-110' : ''
      }`}
    >
      {/* Gloss Highlight Overlays */}
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/35 to-transparent pointer-events-none rounded-t-2xl"></div>

      {renderPips(num)}

      {/* Sparks / Fire particles effect indicator inside dice body */}
      {style.particles !== 'none' && (
        <div
          className={`absolute -inset-0.5 rounded-2xl border border-white/20 opacity-70 pointer-events-none ${
            style.particles === 'fire' ? 'bg-orange-500/10 animate-pulse' : style.particles === 'sparks' ? 'bg-cyan-400/10 animate-pulse' : 'bg-yellow-300/10'
          }`}
        />
      )}
    </div>
  );
};
export default DiceFace;
