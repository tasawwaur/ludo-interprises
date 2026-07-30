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
}) => {
  if (!player) return null;

  const [isMicOn, setIsMicOn] = useState(VoiceChatService.isMicrophoneActive());

  const handleToggleMic = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMicOn) {
      VoiceChatService.stopMicrophone();
      setIsMicOn(false);
    } else {
      const success = await VoiceChatService.startMicrophone();
      setIsMicOn(success);
    }
  };

  const isBottom = position === 'bottom-left' || position === 'bottom-right';

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

        {/* Voice Chat Mic Button (positioned right on top corner of avatar frame) */}
        <button
          onClick={handleToggleMic}
          className={`absolute -top-1 -right-1 z-30 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all shadow-xl cursor-pointer active:scale-90 ${
            isMicOn
              ? 'bg-gradient-to-r from-emerald-500 to-green-600 border-amber-300 text-white animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.9)]'
              : 'bg-gradient-to-r from-red-600 to-rose-700 border-amber-400/80 text-white opacity-95 hover:opacity-100'
          }`}
          title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          <span className="text-[11px] leading-none select-none">{isMicOn ? '🎙️' : '🔇'}</span>
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
