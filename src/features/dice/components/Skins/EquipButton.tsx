import React from 'react';

interface EquipButtonProps {
  onEquip: () => void;
  isEquipped: boolean;
}

export const EquipButton: React.FC<EquipButtonProps> = ({ onEquip, isEquipped }) => {
  return (
    <button
      onClick={onEquip}
      disabled={isEquipped}
      className={`w-full py-2.5 font-black text-xs tracking-wider uppercase rounded-xl transition-all ${
        isEquipped
          ? 'bg-green-500/10 border border-green-500/30 text-green-400 cursor-default'
          : 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 hover:brightness-110 active:scale-95 border border-yellow-200 shadow'
      }`}
    >
      {isEquipped ? 'Equipped ✓' : 'Equip Skin'}
    </button>
  );
};
export default EquipButton;
