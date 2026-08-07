import React, { useState } from 'react';
import { Player } from '../../../game/engine/Engine.types';
import { VoiceChatService } from '../../../game/sound/VoiceChatService';
import { getFrameFilter } from '../../../store/cosmetics.store';

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
  onOpenChat?: () => void;
  onAvatarClick?: () => void;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  isLocalPlayer?: boolean;
  remoteMicStatus?: boolean;
  onMicToggle?: (isMicOn: boolean) => void;
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
  onOpenChat,
  onAvatarClick,
  position,
  isLocalPlayer = true,
  remoteMicStatus = false,
  onMicToggle,
}) => {
  if (!player) return null;

  const [localMicOn, setLocalMicOn] = useState(VoiceChatService.isMicrophoneActive());

  const handleToggleMic = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLocalPlayer) return;

    if (localMicOn) {
      VoiceChatService.stopMicrophone();
      setLocalMicOn(false);
      onMicToggle?.(false);
    } else {
      const success = await VoiceChatService.startMicrophone();
      setLocalMicOn(success);
      onMicToggle?.(success);
    }
  };

  const isMicOn = isLocalPlayer ? localMicOn : remoteMicStatus;

  const isBottom = position === 'bottom-left' || position === 'bottom-right';
  const isRightSide = position === 'top-right' || position === 'bottom-right';
  const micPositionClass = isRightSide ? 'top-[6px] -right-2' : 'top-[6px] -left-2';

  const glowBorderColors: Record<string, string> = {
    RED: 'border-rose-500 shadow-[0_0_18px_#ef4444,0_0_36px_#f43f5e]',
    GREEN: 'border-emerald-400 shadow-[0_0_18px_#22c55e,0_0_36px_#10b981]',
    YELLOW: 'border-amber-400 shadow-[0_0_18px_#eab308,0_0_36px_#f59e0b]',
    BLUE: 'border-cyan-400 shadow-[0_0_18px_#06b6d4,0_0_36px_#3b82f6]',
  };

  const glowShadowClasses: Record<string, string> = {
    RED: 'drop-shadow-[0_0_15px_rgba(239,68,68,0.95)] drop-shadow-[0_0_30px_rgba(244,63,94,0.8)]',
    GREEN: 'drop-shadow-[0_0_15px_rgba(34,197,94,0.95)] drop-shadow-[0_0_30px_rgba(16,185,129,0.8)]',
    YELLOW: 'drop-shadow-[0_0_15px_rgba(245,158,11,0.95)] drop-shadow-[0_0_30px_rgba(234,179,8,0.8)]',
    BLUE: 'drop-shadow-[0_0_15px_rgba(6,182,212,0.95)] drop-shadow-[0_0_30px_rgba(59,130,246,0.8)]',
  };

  return (
    <div className={`relative flex flex-col items-center select-none min-w-[98px] transition-all duration-300 ${
      isActive ? `scale-105 filter ${glowShadowClasses[player.color] || glowShadowClasses.GREEN}` : ''
    }`}>
      {/* Speech Emoji / Message Popup */}
      {chatBubbleMessage && (
        <div className={`absolute ${isBottom ? '-top-10' : '-bottom-10'} z-40 animate-bounce whitespace-nowrap drop-shadow-[0_6px_14px_rgba(0,0,0,0.9)] select-none`}>
          <span className="text-xs font-extrabold bg-slate-900/95 text-amber-200 border border-amber-400/90 px-3 py-1 rounded-xl shadow-2xl inline-block max-w-[260px] break-words text-center leading-snug">
            {chatBubbleMessage}
          </span>
        </div>
      )}

      {/* 1. Profile Photo Frame */}
      <div className="relative w-[84px] h-[84px] flex items-center justify-center p-1">
        {/* Glowing Border on Active Turn */}
        {isActive && (
          <div className={`absolute -inset-1 rounded-full border-[3px] animate-pulse z-30 pointer-events-none ${glowBorderColors[player.color] || glowBorderColors.GREEN}`} />
        )}

        {/* Circular SVG Timer Ring — smooth green→yellow→red melt */}
        {isActive && (() => {
          const maxSec = turnTimerSeconds > 10 ? 15 : (turnTimerSeconds > 5 ? 10 : 5);
          const t = turnTimerSeconds / maxSec; // 1.0 = full, 0.0 = empty
          // Interpolate hue: 120=green, 60=yellow, 0=red
          const hue = Math.round(t * 120);
          const sat = 90;
          const lit = t > 0.5 ? 48 : 52;
          const ringColor = `hsl(${hue}, ${sat}%, ${lit}%)`;
          const glowColor = `hsl(${hue}, ${sat}%, 55%)`;
          const circumference = 2 * Math.PI * 37;

          return (
            <svg className="absolute inset-0 w-full h-full -rotate-90 z-25 pointer-events-none">
              {/* Track ring (dim background) */}
              <circle
                cx="42" cy="42" r="37"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="3.5"
                fill="transparent"
              />
              {/* Active timer ring */}
              <circle
                cx="42" cy="42" r="37"
                stroke={ringColor}
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - t)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
                style={{
                  filter: turnTimerSeconds <= 5
                    ? `drop-shadow(0 0 7px ${glowColor})`
                    : `drop-shadow(0 0 3px ${glowColor})`
                }}
              />
            </svg>
          );
        })()}


        {/* Golden frame image with getFrameFilter applied */}
        <button
          onClick={onAvatarClick}
          disabled={!onAvatarClick}
          className="absolute inset-0 z-10 cursor-pointer border-0 outline-none bg-transparent p-0 hover:scale-102 active:scale-98 transition-transform disabled:pointer-events-none"
        >
          {/* Avatar image cutout inside the frame */}
          <div
            className="absolute rounded-full overflow-hidden bg-slate-950 border border-purple-950/20"
            style={{ top: '15%', left: '15%', right: '15%', bottom: '26%' }}
          >
            {player.avatar ? (
              <img
                src={player.avatar}
                alt={player.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-xl bg-slate-900 font-black text-purple-200">
                {player.name.charAt(0)}
              </span>
            )}
          </div>
          
          {/* The visual profile frame overlay */}
          <img
            src="/assets/images/icons/profile_frame_v3.png"
            alt="Profile Frame"
            className="w-full h-full object-contain absolute inset-0 z-20 pointer-events-none"
            style={{ filter: getFrameFilter(player.equippedFrameId) }}
            draggable={false}
          />
        </button>


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
