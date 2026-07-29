import React from 'react';

interface ExitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ExitDialog: React.FC<ExitDialogProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[280px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-red-500/70 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative text-center animate-fade-in">
        <span className="text-4xl mb-2 block">🚨</span>
        <h4 className="text-xs font-black text-red-400 tracking-widest uppercase">LEAVE TOURNAMENT?</h4>
        <p className="text-[9px] text-purple-200 mt-2 font-medium leading-relaxed">
          Unregistering will forfeit your entry fee. Are you sure you want to exit?
        </p>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white font-black text-[10px] uppercase rounded-xl tracking-wider shadow active:scale-95 transition-all"
          >
            YES, EXIT
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white font-black text-[10px] uppercase rounded-xl active:scale-95"
          >
            NO
          </button>
        </div>
      </div>
    </div>
  );
};
export default ExitDialog;
