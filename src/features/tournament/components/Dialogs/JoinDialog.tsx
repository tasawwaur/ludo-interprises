import React from 'react';
import { TournamentItem } from '../../types/tournament.types';

interface JoinDialogProps {
  tournament: TournamentItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  canAfford: boolean;
}

export const JoinDialog: React.FC<JoinDialogProps> = ({
  tournament,
  isOpen,
  onClose,
  onConfirm,
  canAfford,
}) => {
  if (!isOpen) return null;

  const costLabel = tournament.entryCost.coins
    ? `🪙 ${tournament.entryCost.coins} Coins`
    : `💎 ${tournament.entryCost.gems} Gems`;

  return (
    <div className="absolute inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[280px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-amber-500/70 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative animate-fade-in text-center">
        <span className="text-4xl mb-2 block animate-bounce">🏆</span>
        <h4 className="text-xs font-black text-amber-200 tracking-widest uppercase">REGISTRATION</h4>
        <p className="text-[10px] text-purple-300 mt-1">{tournament.name}</p>

        <div className="mt-4 bg-black/35 p-3 rounded-2xl border border-purple-900/30">
          <span className="text-[9px] text-gray-400 block font-bold">ENTRY FEE</span>
          <span className="text-sm font-black text-amber-300 font-mono tracking-wide">{costLabel}</span>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onConfirm}
            disabled={!canAfford}
            className={`flex-1 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-purple-950 font-black text-[10px] uppercase rounded-xl tracking-wider shadow ${
              !canAfford ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 transition-all'
            }`}
          >
            CONFIRM ENTRY
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white font-black text-[10px] uppercase rounded-xl active:scale-95"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};
export default JoinDialog;
