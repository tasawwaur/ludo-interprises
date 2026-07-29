import React from 'react';
import { DiceItem } from '../../types/dice.types';

interface UpgradeDiceDialogProps {
  dice: DiceItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const UpgradeDiceDialog: React.FC<UpgradeDiceDialogProps> = ({
  dice,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const cost = dice.level * 1500;

  return (
    <div className="absolute inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[280px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-amber-500/70 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-black text-amber-200 tracking-widest uppercase">UPGRADE DICE</span>
          <button onClick={onClose} className="text-amber-200 font-bold hover:scale-105 active:scale-95">✕</button>
        </div>

        {/* Content */}
        <div className="bg-purple-950/50 border border-purple-800/60 rounded-2xl p-4 text-center mb-4">
          <span className="text-4xl mb-2 block">⚡</span>
          <h4 className="text-xs font-black text-white">{dice.name}</h4>
          <span className="text-[9px] text-amber-300 font-bold block mt-1">Level {dice.level} ➔ {dice.level + 1}</span>
          
          <div className="mt-3 bg-black/30 p-2 rounded-xl border border-purple-900/20 text-left flex flex-col gap-1">
            <div className="flex justify-between text-[8px] text-purple-200">
              <span>Roll Mod (Six Chance):</span>
              <span className="text-white">+{0.4}%</span>
            </div>
            <div className="flex justify-between text-[8px] text-purple-200">
              <span>Gold Multiplier:</span>
              <span className="text-white">+0.1x</span>
            </div>
          </div>

          <div className="mt-3 text-amber-300 font-black text-xs">
            Cost: 🪙 {cost} Coins
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-black text-[10px] tracking-wider uppercase rounded-xl active:scale-95 shadow-md"
          >
            CONFIRM UPGRADE
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 text-white font-black text-[10px] tracking-wider uppercase rounded-xl active:scale-95"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};
export default UpgradeDiceDialog;
