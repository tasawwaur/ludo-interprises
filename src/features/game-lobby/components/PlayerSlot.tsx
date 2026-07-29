import React from 'react';
import { LobbyPlayer } from '../types/lobby.types';

interface PlayerSlotProps {
  player?: LobbyPlayer;
  onInvite?: () => void;
}

export const PlayerSlot: React.FC<PlayerSlotProps> = ({ player, onInvite }) => {
  if (!player) {
    return (
      <button
        onClick={onInvite}
        className="w-full h-32 rounded-2xl bg-purple-950/40 border-2 border-dashed border-purple-500/40 p-4 flex flex-col items-center justify-center gap-2 hover:bg-purple-900/50 transition-colors cursor-pointer"
      >
        <div className="w-12 h-12 rounded-full bg-purple-900/60 flex items-center justify-center text-2xl text-purple-300 shadow">
          ➕
        </div>
        <span className="text-xs font-bold text-purple-200">Waiting for Player...</span>
        <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
          Tap to Invite
        </span>
      </button>
    );
  }

  return (
    <div className="w-full h-32 rounded-2xl bg-slate-950/80 border border-purple-500/40 p-4 flex flex-col items-center justify-between shadow-xl backdrop-blur-md relative overflow-hidden">
      {/* Speaking Green Ring */}
      <div
        className={`w-14 h-14 rounded-full border-2 p-0.5 transition-all ${
          player.isSpeaking ? 'border-[#00d26a] animate-pulse ring-4 ring-[#00d26a]/30' : 'border-amber-400'
        }`}
      >
        <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden flex items-center justify-center text-2xl">
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            <span>👤</span>
          )}
        </div>
      </div>

      {/* Name & Rank */}
      <div className="text-center">
        <span className="text-sm font-black text-white block truncate max-w-[120px]">
          {player.name}
        </span>
        <span className="text-[10px] font-bold text-amber-300 uppercase">
          🏆 {player.rank}
        </span>
      </div>

      {/* Ready Badge */}
      {player.isReady ? (
        <span className="bg-[#00d26a] text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-300 shadow">
          🟢 READY
        </span>
      ) : (
        <span className="bg-amber-500/20 text-amber-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-amber-400/40">
          ⏳ NOT READY
        </span>
      )}
    </div>
  );
};
