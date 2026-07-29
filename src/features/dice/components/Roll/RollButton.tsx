import React from 'react';

interface RollButtonProps {
  onRoll: () => void;
  disabled?: boolean;
}

export const RollButton: React.FC<RollButtonProps> = ({ onRoll, disabled = false }) => {
  return (
    <button
      onClick={onRoll}
      disabled={disabled}
      className={`w-full py-3.5 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs tracking-widest uppercase rounded-2xl shadow-xl transition-all border border-yellow-200 ${
        disabled
          ? 'opacity-50 cursor-not-allowed hover:scale-100'
          : 'hover:scale-[1.02] active:scale-95'
      }`}
    >
      ROLL ACTIVE DICE
    </button>
  );
};
export default RollButton;
