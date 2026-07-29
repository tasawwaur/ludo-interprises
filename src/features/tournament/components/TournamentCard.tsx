import React from 'react';
import { TournamentItem } from '../types/tournament.types';
import CountdownTimer from './CountdownTimer';

interface TournamentCardProps {
  tournament: TournamentItem;
  isRegistered: boolean;
  onClick?: () => void;
  onJoin?: () => void;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  isRegistered,
  onClick,
  onJoin,
}) => {
  const isCoinsCost = !!tournament.entryCost.coins;

  return (
    <div
      onClick={onClick}
      className="bg-purple-950/80 border-2 border-purple-500/40 rounded-3xl p-4 flex items-center justify-between shadow-2xl hover:scale-[1.01] hover:border-purple-400 transition-all cursor-pointer glow-purple-border"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-xl shadow border border-white/10">
          🏆
        </div>
        <div>
          <span className="text-[9px] font-black text-purple-300 block uppercase tracking-wider">PRIZE POOL</span>
          <span className="text-base font-black text-amber-400 block leading-tight">{tournament.prizePool}</span>
          <span className="text-[8px] text-gray-400 font-bold block mt-0.5">
            Entry: {isCoinsCost ? `🪙 ${tournament.entryCost.coins}` : `💎 ${tournament.entryCost.gems}`} • Registered: {tournament.registeredCount}/{tournament.maxParticipants}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <CountdownTimer endTime={tournament.endTime} />
        {isRegistered ? (
          <span className="text-[9px] font-black text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-xl">
            REGISTERED ✓
          </span>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoin?.();
            }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-slate-950 font-black px-4.5 py-1.5 rounded-xl text-[10px] uppercase shadow border border-emerald-300 active:scale-95 transition-all"
          >
            ENTER
          </button>
        )}
      </div>
    </div>
  );
};
export default TournamentCard;
