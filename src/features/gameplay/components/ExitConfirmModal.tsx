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
      <div className="w-full max-w-[360px] bg-gradient-to-b from-[#2A0B34] to-[#12061F] border-2 border-red-500/60 rounded-3xl p-6 flex flex-col items-center text-center shadow-[0_0_50px_rgba(239,68,68,0.3)]">
        {/* Crown / Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center text-3xl mb-3 shadow">
          👑
        </div>

        {/* Title (Matching Image #17) */}
        <h2 className="text-xl font-black tracking-wider text-white uppercase drop-shadow mb-2">
          EXIT GAME?
        </h2>

        {/* Description */}
        <p className="text-xs font-semibold text-gray-300 mb-6 leading-relaxed">
          Are you sure you want to exit the game? Your progress will be lost.
        </p>

        {/* Action Buttons Row */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onConfirmExit}
            className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg border border-red-400 active:scale-95 transition-transform"
          >
            EXIT
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-gradient-to-r from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg border border-purple-400 active:scale-95 transition-transform"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};
