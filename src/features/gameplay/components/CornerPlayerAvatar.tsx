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
    <div className="relative flex flex-col items-center select-none min-w-[98px]">
      {/* 1. Profile Photo Frame */}
      <div className="relative w-[84px] h-[84px] flex items-center justify-center p-1">
        {/* Avatar Image cutout */}
        <div
          className="absolute rounded-full overflow-hidden z-10 bg-slate-900"
          style={{ top: '16%', left: '20%', right: '20%', bottom: '28%' }}
        >
          {player.avatar ? (
            <img
              src={player.avatar}
              alt="Player"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-2xl bg-slate-900">👤</span>
          )}
        </div>

        {/* Golden Profile Frame overlay */}
        <img
          src={player.profileFrame || "/assets/images/icons/profile_frame_v3.png"}
          alt="Profile Frame"
          className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none"
          draggable={false}
        />
      </div>

      {/* 2. Name Frame */}
      <div className="relative w-[98px] -mt-[6px] flex flex-col items-center justify-center select-none">
        <img
          src={player.nameBanner || "/assets/images/icons/name_banner_v2.png"}
          alt="Name Frame"
          className="w-full h-auto object-contain pointer-events-none"
          draggable={false}
        />
        <span 
          className={`absolute inset-0 flex items-center justify-center font-black text-amber-200 tracking-wider drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] pointer-events-none px-2 text-center overflow-hidden truncate max-w-[90%] ${
            player.name.length <= 8 ? 'text-[8.5px]' : player.name.length <= 12 ? 'text-[7.5px]' : 'text-[6.5px]'
          }`}
        >
          {player.name}
        </span>
      </div>
    </div>
  );
};
