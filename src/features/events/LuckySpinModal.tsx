import React, { useState } from "react";

interface LuckySpinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpinWin?: (reward: string) => void;
}

export const LuckySpinModal: React.FC<LuckySpinModalProps> = ({ isOpen, onClose, onSpinWin }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    const newRotation = rotation + 1440 + Math.floor(Math.random() * 360);
    setRotation(newRotation);

    setTimeout(() => {
      setIsSpinning(false);
      onSpinWin?.("1,000 COINS");
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-[380px] bg-gradient-to-b from-[#2A0B34] to-[#12061F] border-2 border-amber-400/60 rounded-3xl p-5 flex flex-col items-center relative shadow-[0_0_50px_rgba(255,193,7,0.3)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 border border-white/20 text-gray-300 flex items-center justify-center text-sm hover:text-white"
        >
          ✕
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl animate-spin">🎰</span>
          <h2 className="text-xl font-black tracking-wider text-amber-400 uppercase drop-shadow">
            LUCKY SPIN
          </h2>
        </div>

        {/* Wheel Graphic (Matching Image #7) */}
        <div className="relative w-64 h-64 my-3 flex items-center justify-center">
          {/* Wheel Pointer Arrow */}
          <div className="absolute -top-3 z-30 text-3xl text-amber-400 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            ▼
          </div>

          {/* Rotating Wheel Circle */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-400 bg-gradient-to-tr from-purple-800 via-blue-700 to-indigo-900 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-[3500ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="text-center font-black text-xs space-y-4">
              <div className="text-yellow-300">100K 🪙</div>
              <div className="flex justify-between w-48 text-blue-300">
                <span>1K 🪙</span>
                <span>3K 🪙</span>
              </div>
              <div className="text-green-400">10K 🪙</div>
              <div className="flex justify-between w-48 text-pink-300">
                <span>2K 🪙</span>
                <span>20 💎</span>
              </div>
            </div>

            {/* Center SPIN Button Dial */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 border-2 border-yellow-100 flex items-center justify-center text-slate-950 font-black text-sm shadow-2xl hover:scale-110 active:scale-95 transition-transform z-20"
            >
              SPIN
            </button>
          </div>
        </div>

        {/* Timer Info */}
        <div className="text-center my-2">
          <span className="text-[10px] text-purple-200 block">Next Free Spin in:</span>
          <span className="text-xs font-black text-amber-400 font-mono">11:59:45</span>
        </div>

        {/* Spin Now Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className="w-full py-3 bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 rounded-2xl text-slate-950 font-black text-xs tracking-widest uppercase shadow-xl flex items-center justify-center gap-2 border border-yellow-200 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <span>SPIN NOW</span>
          <span className="flex items-center gap-1 bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full text-[10px]">
            💎 20
          </span>
        </button>
      </div>
    </div>
  );
};
