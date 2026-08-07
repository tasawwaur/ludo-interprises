import React, { useState, useEffect, useRef } from 'react';
import { getDiceStyle } from '../../../utils/cosmeticStyles';

interface Royal3DDiceProps {
  value: number | null;
  isActiveTurn?: boolean;
  canRoll?: boolean;
  onRoll?: () => void;
  size?: number;
  playerColor?: string;
  badgePosition?: 'left' | 'right';
  diceId?: string;
}

export const Royal3DDice: React.FC<Royal3DDiceProps> = ({
  value,
  isActiveTurn = false,
  canRoll = false,
  onRoll,
  size = 46,
  playerColor,
  badgePosition = 'right',
  diceId = 'dice_classic'
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayVal, setDisplayVal] = useState<number>(value || 1);
  const [showBadge, setShowBadge] = useState(false);
  const lastValueRef = useRef<number | null>(null);

  const styleInfo = getDiceStyle(diceId);

  // Trigger roll animation when value changes
  useEffect(() => {
    if (value && value > 0 && value !== lastValueRef.current) {
      lastValueRef.current = value;
      setIsAnimating(true);
      setShowBadge(false);

      let count = 0;
      const interval = setInterval(() => {
        setDisplayVal(Math.floor(Math.random() * 6) + 1);
        count++;
        if (count >= 10) {
          clearInterval(interval);
          setDisplayVal(value);
          setIsAnimating(false);
          setShowBadge(true);
        }
      }, 50);

      return () => clearInterval(interval);
    } else if (!value) {
      lastValueRef.current = null;
      setShowBadge(false);
      setIsAnimating(false);
    }
  }, [value]);

  const handleDiceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Guards — only allow click when it's your turn and not already rolling
    if (!canRoll || isAnimating) return;

    // Start local visual roll immediately
    setIsAnimating(true);
    setShowBadge(false);
    onRoll?.();
  };

  // Render 3D Royal Cube with Dynamic Pips
  const renderPips = (val: number) => {
    const isSix = val === 6;
    const dotColor = isSix ? '#ef4444' : styleInfo.dotColor;
    const dotShadow = isSix ? '0 0 8px rgba(220,38,38,0.9)' : 'inset 0 1px 2px rgba(0,0,0,0.5)';

    const dotStyle = {
      backgroundColor: dotColor,
      boxShadow: dotShadow
    };

    switch (val) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className="w-3.5 h-3.5 rounded-full" style={dotStyle}></span>
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-1.5">
            <span className="w-2.5 h-2.5 rounded-full self-start" style={dotStyle}></span>
            <span className="w-2.5 h-2.5 rounded-full self-end" style={dotStyle}></span>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-1.5">
            <span className="w-2.5 h-2.5 rounded-full self-start" style={dotStyle}></span>
            <span className="w-2.5 h-2.5 rounded-full self-center" style={dotStyle}></span>
            <span className="w-2.5 h-2.5 rounded-full self-end" style={dotStyle}></span>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 p-1.5 gap-1.5 items-center justify-items-center">
            <span className="w-2.5 h-2.5 rounded-full" style={dotStyle}></span>
            <span className="w-2.5 h-2.5 rounded-full" style={dotStyle}></span>
            <span className="w-2.5 h-2.5 rounded-full" style={dotStyle}></span>
            <span className="w-2.5 h-2.5 rounded-full" style={dotStyle}></span>
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full relative p-1.5">
            <div className="w-full h-full grid grid-cols-2 gap-2 items-center justify-items-center">
              <span className="w-2.5 h-2.5 rounded-full" style={dotStyle}></span>
              <span className="w-2.5 h-2.5 rounded-full" style={dotStyle}></span>
              <span className="w-2.5 h-2.5 rounded-full" style={dotStyle}></span>
              <span className="w-2.5 h-2.5 rounded-full" style={dotStyle}></span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={dotStyle}></span>
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-3 p-1.5 gap-1 items-center justify-items-center">
            <span className="w-2 h-2 rounded-full" style={dotStyle}></span>
            <span className="w-2 h-2 rounded-full" style={dotStyle}></span>
            <span className="w-2 h-2 rounded-full" style={dotStyle}></span>
            <span className="w-2 h-2 rounded-full" style={dotStyle}></span>
            <span className="w-2 h-2 rounded-full" style={dotStyle}></span>
            <span className="w-2 h-2 rounded-full" style={dotStyle}></span>
          </div>
        );
      default:
        return null;
    }
  };

  const badgePositionClass = badgePosition === 'left'
    ? 'right-[88px]'
    : 'left-[88px]';

  return (
    <div
      onClick={handleDiceClick}
      style={{ width: `${size}px`, height: `${size}px` }}
      className="relative select-none transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 pointer-events-auto"
    >
      <style>{`
        @keyframes diceRollingStyle {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(360deg) scale(1.15); }
          50% { transform: rotate(720deg) scale(0.95); }
          75% { transform: rotate(1080deg) scale(1.1); }
          100% { transform: rotate(1440deg) scale(1); }
        }
        .animate-dice-rolling {
          animation: diceRollingStyle 0.55s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
        }
      `}</style>

      {/* 3D Glowing Active Aura when turn is active */}
      {isActiveTurn && (
        <div
          className="absolute -inset-2 rounded-2xl blur-md animate-pulse pointer-events-none"
          style={{
            backgroundColor: styleInfo.shadowColor !== 'rgba(0,0,0,0.5)' ? styleInfo.shadowColor : '#fbbf24',
            boxShadow: `0 0 20px 4px ${styleInfo.shadowColor}`
          }}
        />
      )}

      {/* 3D Royal Dice Box */}
      <div
        className={`w-full h-full rounded-2xl bg-gradient-to-br ${styleInfo.bgGradient} border-2 ${styleInfo.borderColor} flex items-center justify-center relative overflow-hidden transition-all ${
          isAnimating ? 'animate-dice-rolling' : ''
        }`}
        style={{
          boxShadow: `0 8px 20px ${styleInfo.shadowColor !== 'rgba(0,0,0,0.5)' ? styleInfo.shadowColor : 'rgba(0,0,0,0.85)'}, inset 0 2px 4px rgba(255,255,255,0.7), inset 0 -2px 4px rgba(0,0,0,0.2)`
        }}
      >
        {/* Shiny Gloss Highlight */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/45 to-transparent pointer-events-none"></div>

        {/* Dice Face Pips */}
        <div className="relative z-10 w-full h-full">
          {renderPips(displayVal)}
        </div>

        {/* Dynamic visual effect overlay (sparks/fire) */}
        {styleInfo.particles !== 'none' && (
          <div
            className={`absolute inset-0 opacity-40 pointer-events-none mix-blend-overlay ${
              styleInfo.particles === 'fire' ? 'bg-orange-500' : styleInfo.particles === 'sparks' ? 'bg-cyan-400' : 'bg-yellow-300'
            }`}
          />
        )}
      </div>

      {/* Dice Value Badge next to Dice Frame */}
      {showBadge && (
        <div className={`absolute top-1/2 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 border border-amber-300 rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.65)] flex items-center justify-center min-w-[34px] animate-[fadeIn_0.2s_ease-out] z-50 pointer-events-none ${badgePositionClass}`}>
          <span className="text-[14px] font-black text-slate-950 font-mono drop-shadow-sm">
            {displayVal}
          </span>
        </div>
      )}
    </div>
  );
};
export default Royal3DDice;
