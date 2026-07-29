import React from 'react';
import { Player } from '../../../game/engine/Engine.types';
import { Avatar, Badge } from '../../../components/ui';
import { DiceFace } from './DiceFace';

interface CornerPlayerAvatarProps {
  player?: Player;
  isActive: boolean;
  diceValue: number | null;
  isDiceRolled: boolean;
  canRoll: boolean;
  turnTimerSeconds?: number;
  isAutoMode?: boolean;
  chatBubbleMessage?: string | null;
  onRollDice?: () => void;
  onSendGift?: () => void;
  onDisableAutoMode?: () => void;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const CornerPlayerAvatar: React.FC<CornerPlayerAvatarProps> = ({
  player,
  isActive,
  diceValue,
  canRoll,
  turnTimerSeconds = 15,
  isAutoMode = false,
  chatBubbleMessage,
  onRollDice,
  onSendGift,
  onDisableAutoMode,
  position,
}) => {
  if (!player) return null;

  const isBottom = position === 'bottom-left' || position === 'bottom-right';
  const maxTimer = isAutoMode ? 5 : 15;
  const progressPercent = Math.max(0, Math.min(100, (turnTimerSeconds / maxTimer) * 100));

  return (
    <div className="relative flex flex-col items-center gap-1 min-w-[110px]">
      {/* Speech Bubble Popup */}
      {chatBubbleMessage && (
        <div className={`absolute ${isBottom ? '-top-10' : '-bottom-10'} z-30 bg-white text-slate-900 px-3 py-1 rounded-2xl text-xs font-extrabold shadow-2xl border border-slate-300 animate-bounce whitespace-nowrap`}>
          {chatBubbleMessage}
        </div>
      )}

      {/* Main Avatar, AUTO Toggle, Gift Icon & Full 3D Dice Row */}
      <div className="flex items-center gap-2">
        {/* Avatar Container with Circular Countdown Ring */}
        <div className="relative flex items-center justify-center p-1">
          {/* Circular Progress Ring */}
          {isActive && (
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="21"
                fill="none"
                stroke="#1e293b"
                strokeWidth="3.5"
              />
              <circle
                cx="24"
                cy="24"
                r="21"
                fill="none"
                stroke={isAutoMode ? '#eab308' : turnTimerSeconds <= 4 ? '#ef4444' : '#22c55e'}
                strokeWidth="3.5"
                strokeDasharray="131.9"
                strokeDashoffset={131.9 - (131.9 * progressPercent) / 100}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
          )}

          {/* Player Avatar */}
          <div className={`relative p-0.5 rounded-full transition-all duration-300 ${
            isActive ? 'scale-105 shadow-2xl' : 'opacity-90'
          }`}>
            <Avatar name={player.name} isOnline badge={player.color} />
          </div>

          {/* AUTO Mode Toggle Button */}
          {isAutoMode && isActive && (
            <button
              onClick={onDisableAutoMode}
              className="absolute -top-3 -right-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-lg flex items-center gap-0.5 cursor-pointer animate-bounce z-20"
              title="Click to Disable Auto Mode"
            >
              AUTO ✓
            </button>
          )}

          {/* 🎁 Clean Gift Box Icon */}
          <button
            onClick={onSendGift}
            className="absolute -top-1 -right-1 text-base shadow-sm hover:scale-130 transition-transform cursor-pointer bg-transparent border-none p-0"
            title="Send Gift"
          >
            🎁
          </button>
        </div>

        {/* Full Dice Face Display */}
        <button
          disabled={!canRoll}
          onClick={onRollDice}
          className={`relative p-0.5 rounded-2xl transition-all duration-200 ${
            canRoll
              ? 'cursor-pointer hover:scale-110 active:scale-95 animate-bounce ring-4 ring-amber-400/80 shadow-2xl'
              : isActive
              ? 'ring-2 ring-amber-400/40 shadow-lg'
              : 'opacity-70'
          }`}
        >
          <DiceFace value={diceValue} size={44} isRolling={false} />
        </button>
      </div>

      {/* Username Display & Teammate Badge */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs font-black text-white truncate max-w-[120px] block shadow-sm text-center">
          {player.name}
        </span>
        {player.team && (
          <Badge
            variant={player.team === 'TEAM_A' ? 'emerald' : 'amber'}
            className="text-[9px] px-1.5 py-0 font-extrabold shadow"
          >
            🤝 {player.team === 'TEAM_A' ? 'TEAM A' : 'TEAM B'}
          </Badge>
        )}
      </div>
    </div>
  );
};
