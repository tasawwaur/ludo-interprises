import React, { useState, useEffect, useRef } from 'react';

interface Royal3DDiceProps {
  value: number | null;
  isActiveTurn?: boolean;
  canRoll?: boolean;
  onRoll?: () => void;
  size?: number;
  playerColor?: string;
}

export const Royal3DDice: React.FC<Royal3DDiceProps> = ({
  value,
  isActiveTurn = false,
  canRoll = false,
  onRoll,
  size = 46,
  playerColor,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayVal, setDisplayVal] = useState<number>(value || 1);
  // 🔒 Lock ref — prevents double-click and overlapping rolls
  const isRollingRef = useRef(false);

  // Show final dice value after server resolves it
  useEffect(() => {
    if (value && value > 0 && !isRollingRef.current) {
      // Quick shuffle animation then settle on real value
      let count = 0;
      const interval = setInterval(() => {
        setDisplayVal(Math.floor(Math.random() * 6) + 1);
        count++;
        if (count >= 6) {
          clearInterval(interval);
          setDisplayVal(value);
          setIsAnimating(false);
        }
      }, 55);
      return () => clearInterval(interval);
    }
  }, [value]);

  const handleDiceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // 🚫 Guards — only allow click when it's your turn and not already rolling
    if (!canRoll || isRollingRef.current || isAnimating) return;

    // 🔒 Lock immediately to block any second click
    isRollingRef.current = true;
    setIsAnimating(true);

    let count = 0;
    const interval = setInterval(() => {
      setDisplayVal(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 8) {
        clearInterval(interval);
        setIsAnimating(false);
        // ✅ Fire roll ONCE after animation completes
        onRoll?.();
        // Unlock after short cooldown so state can update
        setTimeout(() => {
          isRollingRef.current = false;
        }, 600);
      }
    }, 50);
  };


  // Render 3D Ivory White Royal Cube with Pips
  const renderPips = (val: number) => {
    const isSix = val === 6;
    const dotBg = isSix ? 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.9)]' : 'bg-slate-900 shadow-inner';

    switch (val) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <span className={`w-3.5 h-3.5 rounded-full ${dotBg}`}></span>
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-1.5">
            <span className={`w-2.5 h-2.5 rounded-full self-start ${dotBg}`}></span>
            <span className={`w-2.5 h-2.5 rounded-full self-end ${dotBg}`}></span>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-1.5">
            <span className={`w-2.5 h-2.5 rounded-full self-start ${dotBg}`}></span>
            <span className={`w-2.5 h-2.5 rounded-full self-center ${dotBg}`}></span>
            <span className={`w-2.5 h-2.5 rounded-full self-end ${dotBg}`}></span>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 p-1.5 gap-1.5 items-center justify-items-center">
            <span className={`w-2.5 h-2.5 rounded-full ${dotBg}`}></span>
            <span className={`w-2.5 h-2.5 rounded-full ${dotBg}`}></span>
            <span className={`w-2.5 h-2.5 rounded-full ${dotBg}`}></span>
            <span className={`w-2.5 h-2.5 rounded-full ${dotBg}`}></span>
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full relative p-1.5">
            <div className="w-full h-full grid grid-cols-2 gap-2 items-center justify-items-center">
              <span className={`w-2.5 h-2.5 rounded-full ${dotBg}`}></span>
              <span className={`w-2.5 h-2.5 rounded-full ${dotBg}`}></span>
              <span className={`w-2.5 h-2.5 rounded-full ${dotBg}`}></span>
              <span className={`w-2.5 h-2.5 rounded-full ${dotBg}`}></span>
            </div>
            <span className={`w-2.5 h-2.5 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${dotBg}`}></span>
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full grid grid-cols-2 grid-rows-3 p-1.5 gap-1 items-center justify-items-center">
            <span className={`w-2 h-2 rounded-full ${dotBg}`}></span>
            <span className={`w-2 h-2 rounded-full ${dotBg}`}></span>
            <span className={`w-2 h-2 rounded-full ${dotBg}`}></span>
            <span className={`w-2 h-2 rounded-full ${dotBg}`}></span>
            <span className={`w-2 h-2 rounded-full ${dotBg}`}></span>
            <span className={`w-2 h-2 rounded-full ${dotBg}`}></span>
          </div>
        );
      default:
        return null;
    }
  };

  let glowBg = "bg-amber-400/50";
  if (playerColor === "RED") glowBg = "bg-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.7)]";
  else if (playerColor === "BLUE") glowBg = "bg-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.7)]";
  else if (playerColor === "GREEN") glowBg = "bg-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.7)]";
  else if (playerColor === "YELLOW") glowBg = "bg-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.7)]";

  return (
    <div
      onClick={handleDiceClick}
      style={{ width: `${size}px`, height: `${size}px` }}
      className="relative select-none transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 pointer-events-auto"
    >
      {/* 3D Glowing Active Aura when turn is active */}
      {isActiveTurn && (
        <div className={`absolute -inset-2 rounded-2xl ${glowBg} blur-md animate-pulse pointer-events-none`}></div>
      )}

      {/* 3D Ivory Royal Dice Box */}
      <div
        className={`w-full h-full rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 border-2 border-amber-300/90 shadow-[0_8px_20px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(0,0,0,0.2)] flex items-center justify-center relative overflow-hidden transition-all ${
          isAnimating ? 'animate-bounce rotate-[720deg] scale-110 duration-500' : ''
        }`}
      >
        {/* Shiny Gloss Highlight */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/60 to-transparent pointer-events-none"></div>

        {/* Dice Face Pips */}
        <div className="relative z-10 w-full h-full">
          {renderPips(displayVal)}
        </div>
      </div>
    </div>
  );
};
