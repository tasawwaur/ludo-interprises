import React, { useEffect, useState } from "react";
import { useQueueStore } from "../queue/QueueStore";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";

interface MatchmakingPageProps {
  onCancel: () => void;
  onMatchFound: () => void;
}

export const MatchmakingPage: React.FC<MatchmakingPageProps> = ({ onCancel, onMatchFound }) => {
  const { mode, setMatchFound } = useQueueStore();
  const [seconds, setSeconds] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setMatchFound(true);
          onMatchFound();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setMatchFound, onMatchFound]);

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Background */}
      <LudoPageBackground variant="room" />

      <div className="w-full max-w-[400px] flex-1 flex flex-col items-center justify-between z-10">
        {/* Header */}
        <div className="text-center mt-6">
          <span className="text-xs font-black tracking-widest text-amber-400 uppercase bg-black/60 px-5 py-2 rounded-full border-2 border-amber-400/50 shadow-lg glow-gold-border">
            {mode || "1 ON 1 CLASSIC"}
          </span>
        </div>

        {/* Searching Opponent Banner & Graphic (Matching Image #18) */}
        <div className="flex flex-col items-center text-center my-auto">
          <h2 className="text-2xl font-black tracking-wider text-white uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] mb-6 glow-amber-text">
            SEARCHING OPPONENT
          </h2>

          {/* Animated Pawns & Dice Circle */}
          <div className="relative w-44 h-44 flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-amber-400/60 animate-[spin_8s_linear_infinite] shadow-2xl"></div>
            <div className="absolute inset-4 rounded-full border-2 border-dashed border-purple-400/40 animate-[spin_12s_linear_infinite_reverse]"></div>

            <div className="absolute top-2 left-2 text-3xl animate-bounce">🔴</div>
            <div className="absolute top-2 right-2 text-3xl animate-bounce" style={{ animationDelay: "0.2s" }}>🟡</div>
            <div className="absolute bottom-2 left-2 text-3xl animate-bounce" style={{ animationDelay: "0.4s" }}>🟢</div>
            <div className="absolute bottom-2 right-2 text-3xl animate-bounce" style={{ animationDelay: "0.6s" }}>🔵</div>

            <span className="text-5xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] animate-pulse">🎲</span>
          </div>

          <span className="text-xs font-black text-gray-300">
            Estimated time: <span className="text-amber-400 font-mono font-black glow-amber-text ml-1">00:{seconds < 10 ? `0${seconds}` : seconds}</span>
          </span>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="w-full py-4 bg-gradient-to-r from-purple-800 to-indigo-900 rounded-2xl text-white font-black text-xs tracking-widest uppercase shadow-2xl border-2 border-purple-400 hover:scale-[1.02] active:scale-95 transition-all mb-4"
        >
          CANCEL
        </button>
      </div>
    </div>
  );
};
