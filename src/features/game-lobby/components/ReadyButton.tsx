import React from 'react';

interface ReadyButtonProps {
  isReady: boolean;
  onToggleReady: () => void;
  disabled?: boolean;
}

export const ReadyButton: React.FC<ReadyButtonProps> = ({
  isReady,
  onToggleReady,
  disabled = false,
}) => {
  return (
    <button
      onClick={onToggleReady}
      disabled={disabled}
      className={`w-full py-4 rounded-2xl font-black text-lg tracking-widest uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer ${
        isReady
          ? 'bg-gradient-to-r from-[#00d26a] via-emerald-400 to-[#00a651] border-2 border-emerald-200 text-slate-950 shadow-[0_10px_30px_rgba(0,210,106,0.4)]'
          : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border-2 border-yellow-200 text-slate-950 shadow-[0_10px_30px_rgba(245,158,11,0.4)]'
      }`}
    >
      {isReady ? '🟢 READY ✓' : '⚡ PRESS READY'}
    </button>
  );
};
