import React, { useState, useCallback } from 'react';

interface ProtectButtonProps {
  localPlayer: { color: string } | null | undefined;
  gameState: { currentTurnColor?: string; gameStatus?: string } | null | undefined;
}

export const ProtectButton: React.FC<ProtectButtonProps> = ({ localPlayer, gameState }) => {
  const [isProtected, setIsProtected] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);

  const isMyTurn = localPlayer && gameState?.currentTurnColor === localPlayer.color;

  const handleProtect = useCallback(() => {
    if (cooldown) return;

    const next = !isProtected;
    setIsProtected(next);
    setCooldown(true);

    setToast(next ? '🛡️ Protected!' : '🛡️ Removed');
    setTimeout(() => setToast(null), 1500);
    setTimeout(() => setCooldown(false), 3000);
  }, [isProtected, cooldown]);

  return (
    <div className="relative flex flex-col items-center gap-1">
      {/* Toast notification */}
      {toast && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap
            px-2 py-0.5 rounded-full bg-black/80 border border-amber-400/60
            text-amber-300 text-[9px] font-black tracking-wide shadow-lg
            animate-bounce z-[999]"
        >
          {toast}
        </div>
      )}

      {/* Shield Button */}
      <button
        onClick={handleProtect}
        disabled={cooldown}
        title={isProtected ? 'Remove Protection' : 'Protect Token'}
        className={`
          relative w-[46px] h-[46px] rounded-full flex flex-col items-center justify-center
          border-2 shadow-xl transition-all duration-300 active:scale-90
          ${cooldown ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
          ${isProtected
            ? 'bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 border-yellow-200 shadow-[0_0_18px_rgba(251,191,36,0.7)]'
            : 'bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
          }
        `}
      >
        {/* Shield glow ring when active */}
        {isProtected && (
          <div className="absolute inset-0 rounded-full border-2 border-yellow-200/60 animate-ping opacity-50" />
        )}

        {/* Shield icon */}
        <span
          className={`text-[20px] leading-none transition-all duration-300 ${
            isProtected ? 'drop-shadow-[0_0_6px_rgba(255,220,50,0.9)]' : 'opacity-70'
          }`}
        >
          🛡️
        </span>

        {/* Label */}
        <span
          className={`text-[7px] font-black tracking-widest leading-none mt-0.5 uppercase ${
            isProtected ? 'text-slate-900' : 'text-purple-300'
          }`}
        >
          {isProtected ? 'ON' : 'PROTECT'}
        </span>
      </button>

      {/* Active turn indicator dot */}
      {isMyTurn && (
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
      )}
    </div>
  );
};
