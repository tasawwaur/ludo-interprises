import React from 'react';

interface ResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  winnerName: string;
  isUser: boolean;
  prizeLabel?: string;
}

export const ResultDialog: React.FC<ResultDialogProps> = ({
  isOpen,
  onClose,
  winnerName,
  isUser,
  prizeLabel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[270px] bg-gradient-to-b from-[#2B1440] to-[#12061F] border-2 border-amber-500/70 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative text-center animate-fade-in">
        <span className="text-5xl animate-bounce mb-2 block">{isUser ? '👑' : '💀'}</span>
        <h4 className="text-sm font-black text-amber-200 uppercase tracking-widest leading-none">
          {isUser ? 'VICTORY! 🎉' : 'DEFEAT'}
        </h4>
        <p className="text-[10px] text-purple-200 mt-2 font-bold">
          {isUser ? `You won the tournament match!` : `${winnerName} won the match.`}
        </p>

        {isUser && prizeLabel && (
          <div className="mt-3.5 bg-amber-500/10 border border-amber-500/25 p-2 rounded-xl text-amber-300 text-[10px] font-black uppercase font-mono">
            Unlocks Prize: {prizeLabel}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-purple-950 font-black text-[10px] uppercase rounded-xl hover:scale-105 active:scale-95 transition-transform shadow-md"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
};
export default ResultDialog;
