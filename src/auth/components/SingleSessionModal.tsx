import React from "react";
import { LogOut, ShieldAlert } from "lucide-react";

interface SingleSessionModalProps {
  isOpen: boolean;
  onConfirmLogout: () => void;
}

export const SingleSessionModal: React.FC<SingleSessionModalProps> = ({
  isOpen,
  onConfirmLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in select-none">
      <div className="w-full max-w-[340px] bg-gradient-to-b from-[#2D0A31] via-[#1A0524] to-[#0D0314] border-2 border-rose-500/80 rounded-3xl p-6 flex flex-col items-center text-center shadow-[0_0_60px_rgba(244,63,94,0.5)] relative overflow-hidden">
        {/* Top Glowing Trim */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent blur-xs"></div>

        {/* Shield Alert Icon */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500/20 via-purple-900/40 to-black border-2 border-rose-400 flex items-center justify-center text-3xl mb-4 shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse">
          <ShieldAlert size={38} className="text-rose-400 drop-shadow-[0_2px_10px_rgba(244,63,94,0.8)]" />
        </div>

        {/* Title */}
        <h2 className="text-xl font-black tracking-widest bg-gradient-to-r from-rose-200 via-red-400 to-rose-500 bg-clip-text text-transparent uppercase drop-shadow mb-2">
          LOGGED OUT!
        </h2>

        {/* Description */}
        <p className="text-xs font-bold text-purple-200/90 mb-6 leading-relaxed px-2">
          Your account was logged in on another device or tab. You have been automatically logged out for security.
        </p>

        {/* Confirm Button */}
        <button
          onClick={onConfirmLogout}
          className="w-full py-3 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:brightness-110 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_4px_20px_rgba(225,29,72,0.5)] border border-rose-300 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          <span>OK, GO TO LOGIN</span>
        </button>
      </div>
    </div>
  );
};
