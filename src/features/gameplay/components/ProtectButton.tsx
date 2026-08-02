import React, { useState, useCallback } from 'react';
import { useGameStore } from '../../../store/game.store';
import { useUserStore } from '../../../user/user.store';

interface ProtectButtonProps {
  localPlayer: any;
  gameState: any;
}

export const ProtectButton: React.FC<ProtectButtonProps> = ({ localPlayer, gameState }) => {
  const [toast, setToast] = useState<string | null>(null);
  const undoRoll = useGameStore((s) => s.undoRoll);
  const user = useUserStore((s) => s.user);

  const isMyTurn = localPlayer && gameState?.currentTurnColor === localPlayer.color;
  const isDiceRolled = gameState?.isDiceRolled;
  const gameStatus = gameState?.gameStatus;

  const totalUndosUsed = localPlayer?.totalUndosUsed || 0;
  const undosUsedThisTurn = localPlayer?.undosUsedThisTurn || 0;
  const protectTurnsCount = localPlayer?.protectTurnsCount || 0;

  // Calculate cost of the next protect undo
  const nextProtectTurnsCount = undosUsedThisTurn === 0 ? protectTurnsCount + 1 : protectTurnsCount;

  const getCost = (pCount: number, thisTurnCount: number) => {
    const isSecondUndo = thisTurnCount === 1;
    if (pCount === 1) return isSecondUndo ? 3 : 1;
    if (pCount === 2) return isSecondUndo ? 10 : 5;
    if (pCount === 3) return isSecondUndo ? 40 : 20;
    return 50; // 4th turn onwards
  };

  const cost = getCost(nextProtectTurnsCount, undosUsedThisTurn);
  const userGems = user?.gems ?? 0;

  // Disable conditions
  const isEligible = 
    isMyTurn && 
    isDiceRolled && 
    gameStatus === 'MOVE_WAIT' && 
    totalUndosUsed < 8 && 
    undosUsedThisTurn < 2;

  const hasEnoughGems = userGems >= cost;
  const isDisabled = !isEligible || !hasEnoughGems;

  let statusText = 'PROTECT';
  if (totalUndosUsed >= 8) {
    statusText = 'MAX 8';
  } else if (undosUsedThisTurn >= 2) {
    statusText = 'LIMIT 2';
  }

  const handleProtectClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDisabled) {
      if (isEligible && !hasEnoughGems) {
        setToast('💎 Low Gems!');
        setTimeout(() => setToast(null), 1500);
      }
      return;
    }
    undoRoll();
    setToast('🛡️ Roll Reroll!');
    setTimeout(() => setToast(null), 1500);
  }, [isDisabled, isEligible, hasEnoughGems, undoRoll]);

  return (
    <div className="relative flex flex-col items-center gap-1">
      {/* Toast Notification */}
      {toast && (
        <div
          className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap
            px-3 py-1 rounded-full bg-black/90 border border-amber-400/80
            text-amber-300 text-[10px] font-black tracking-wide shadow-2xl
            animate-bounce z-[999] transition-all duration-300"
        >
          {toast}
        </div>
      )}

      {/* Protect/Undo Shield Button */}
      <button
        onClick={handleProtectClick}
        disabled={isDisabled && !(isEligible && !hasEnoughGems)}
        title={`Undo Roll (Cost: ${cost} Diamonds)`}
        className={`
          relative w-[48px] h-[48px] rounded-full flex flex-col items-center justify-center
          border-2 shadow-2xl transition-all duration-300 active:scale-95
          ${isDisabled 
            ? 'opacity-40 cursor-not-allowed bg-gradient-to-b from-slate-900 via-slate-950 to-black border-slate-700/30' 
            : 'cursor-pointer hover:scale-105 hover:shadow-[0_0_15px_rgba(234,179,8,0.4)] bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-yellow-500/50'
          }
        `}
      >
        {/* Active Shield pulsing ring */}
        {!isDisabled && (
          <div className="absolute inset-0 rounded-full border-2 border-yellow-400/50 animate-ping opacity-35" />
        )}

        {/* Shield Icon */}
        <span
          className={`text-[20px] leading-none transition-all duration-300 ${
            isDisabled ? 'opacity-50' : 'drop-shadow-[0_0_4px_rgba(234,179,8,0.6)]'
          }`}
        >
          🛡️
        </span>

        {/* Label */}
        <span
          className={`text-[7px] font-black tracking-widest leading-none mt-0.5 uppercase ${
            isDisabled ? 'text-slate-500' : 'text-yellow-400'
          }`}
        >
          {statusText}
        </span>

        {/* Dynamic Diamonds Cost Badge */}
        {!isDisabled && (
          <div className="absolute -bottom-1 -right-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 px-1 rounded-full border border-cyan-200/40 shadow flex items-center gap-0.5 text-[8px] font-black text-white">
            <span>💎</span>
            <span>{cost}</span>
          </div>
        )}
      </button>

      {/* Active turn indicator dot */}
      {isMyTurn && (
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_6px_rgba(250,204,21,0.9)]" />
      )}
    </div>
  );
};
