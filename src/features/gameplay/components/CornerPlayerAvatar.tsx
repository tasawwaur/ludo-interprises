import React, { useState } from 'react';
import { Player } from '../../../game/engine/Engine.types';
import { VoiceChatService } from '../../../game/sound/VoiceChatService';

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

  return (
    <div className="relative flex flex-col items-center select-none min-w-[98px]">
      {/* Speech Bubble Popup */}
      {chatBubbleMessage && (
        <div className={`absolute ${isBottom ? '-top-10' : '-bottom-10'} z-40 bg-white text-slate-900 px-3 py-1.5 rounded-2xl text-xs font-black shadow-2xl border-2 border-amber-400 animate-bounce whitespace-nowrap drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]`}>
          {chatBubbleMessage}
        </div>
      )}

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

        {/* Voice Chat Mic Button (Local Player: Clickable Control | Opponent: Read-Only Status Indicator) */}
        {isLocalPlayer ? (
          <button
            onClick={handleToggleMic}
            className={`absolute ${micPositionClass} z-30 w-5 h-5 rounded-full flex items-center justify-center border transition-all shadow-xl cursor-pointer active:scale-90 ${
              isMicOn
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 border-amber-300 text-white animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.9)]'
                : 'bg-gradient-to-r from-red-600 to-rose-700 border-amber-400/80 text-white opacity-95 hover:opacity-100'
            }`}
            title={isMicOn ? "Your Mic: ON (Click to Mute)" : "Your Mic: OFF (Click to Unmute)"}
          >
            <span className="text-[9px] leading-none select-none">{isMicOn ? '🎙️' : '🔇'}</span>
          </button>
        ) : (
          <div
            className={`absolute ${micPositionClass} z-30 w-5 h-5 rounded-full flex items-center justify-center border transition-all shadow-md pointer-events-none ${
              isMicOn
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 border-amber-300 text-white animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                : 'bg-gradient-to-r from-red-900/90 to-slate-800 border-slate-600 text-gray-400 opacity-80'
            }`}
            title={`${player.name}'s Mic: ${isMicOn ? 'ON' : 'OFF'}`}
          >
            <span className="text-[9px] leading-none select-none">{isMicOn ? '🎙️' : '🔇'}</span>
          </div>
        )}
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
