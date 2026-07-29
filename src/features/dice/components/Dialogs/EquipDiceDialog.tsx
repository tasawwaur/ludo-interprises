import React from 'react';
import { DiceItem } from '../../types/dice.types';

interface EquipDiceDialogProps {
  dice: DiceItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const EquipDiceDialog: React.FC<EquipDiceDialogProps> = ({
  dice,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[280px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-amber-500/70 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-black text-amber-200 tracking-widest uppercase">EQUIP DICE</span>
          <button onClick={onClose} className="text-amber-200 font-bold hover:scale-105 active:scale-95">✕</button>
        </div>

        {/* Content */}
        <div className="bg-purple-950/50 border border-purple-800/60 rounded-2xl p-4 text-center mb-4">
          <span className="text-4xl mb-2 block">🎲</span>
          <h4 className="text-xs font-black text-white">{dice.name}</h4>
          <p className="text-[9px] text-purple-300 mt-1">Equip this dice to apply lucky multipliers and customized roll sounds!</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-purple-950 font-black text-[10px] tracking-wider uppercase rounded-xl active:scale-95 shadow-md"
          >
            CONFIRM EQUIP
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
export default EquipDiceDialog;
