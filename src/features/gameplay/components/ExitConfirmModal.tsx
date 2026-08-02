import React from "react";

interface ExitConfirmModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirmExit: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  isOpen,
  onCancel,
  onConfirmExit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-[234px] bg-gradient-to-b from-[#2A0B34] to-[#12061F] border-2 border-red-500/60 rounded-2xl p-4 flex flex-col items-center text-center shadow-[0_0_30px_rgba(239,68,68,0.25)]">
        {/* Crown / Warning Icon */}
        <div className="w-11 h-11 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-xl mb-2 shadow">
          👑
        </div>

        {/* Title */}
        <h2 className="text-sm font-black tracking-wider text-white uppercase drop-shadow mb-1">
          EXIT GAME?
        </h2>

        {/* Description */}
        <p className="text-[9.5px] font-semibold text-gray-300 mb-4 leading-relaxed">
          Are you sure you want to exit the game? Your progress will be lost.
        </p>

        {/* Action Buttons Row */}
        <div className="flex gap-2 w-full">
          <button
            onClick={onConfirmExit}
            className="flex-1 py-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-[9px] uppercase tracking-wider rounded-xl shadow-md border border-red-400 active:scale-95 transition-transform"
          >
            EXIT
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-1.5 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-[9px] uppercase tracking-wider rounded-xl shadow-md border border-purple-400 active:scale-95 transition-transform"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};
