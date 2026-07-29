import React, { useState, useEffect } from 'react';
import { PlayerSlot } from '../components/PlayerSlot';
import { RoomCode } from '../components/RoomCode';
import { VoiceIndicator, PingIndicator } from '../components/VoiceIndicator';
import { ReadyButton } from '../components/ReadyButton';
import { LobbyPlayer } from '../types/lobby.types';

interface MatchmakingPageProps {
  onStartGame: () => void;
  onBack: () => void;
}

export const MatchmakingPage: React.FC<MatchmakingPageProps> = ({ onStartGame, onBack }) => {
  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const players: LobbyPlayer[] = [
    {
      id: 'usr_1',
      name: 'TASAVVUR',
      rank: 'Diamond II',
      isReady: isReady,
      isSpeaking: true,
      pingMs: 28,
    },
  ];

  const handleToggleReady = () => {
    const nextState = !isReady;
    setIsReady(nextState);
    if (nextState) {
      setCountdown(5);
    } else {
      setCountdown(null);
    }
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      onStartGame();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onStartGame]);

  return (
    <div className="min-h-screen w-full text-white flex flex-col justify-between items-center px-4 py-4 relative overflow-hidden select-none font-sans bg-[#12061f]">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#12061f] via-[#2a0b34] to-[#5b174d] z-0"></div>

      {/* Header Bar */}
      <div className="w-full max-w-md flex items-center justify-between z-10">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-extrabold text-amber-300 hover:text-white transition-colors cursor-pointer"
        >
          <span>←</span>
          <span>Lobby</span>
        </button>

        <h1 className="text-lg font-black tracking-wider text-white uppercase drop-shadow">
          MATCHMAKING
        </h1>

        <button className="text-xl hover:scale-110 transition-transform cursor-pointer">
          ⚙️
        </button>
      </div>

      {/* Main Content Card Container */}
      <div className="w-full max-w-md flex flex-col gap-4 z-10">
        {/* Match Card */}
        <div className="w-full bg-slate-950/80 border border-purple-500/40 rounded-2xl p-4 shadow-xl backdrop-blur-md text-center">
          <span className="text-2xl drop-shadow">🎮</span>
          <h2 className="text-lg font-black text-amber-300 tracking-wider uppercase mt-1">
            CLASSIC MATCH
          </h2>
          <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-300 mt-1">
            <span>Ranked 1v1</span>
            <span>•</span>
            <span>2 Players</span>
            <span>•</span>
            <span className="text-amber-400">Est. 15s</span>
          </div>
        </div>

        {/* Player Slots (2 Players) */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <PlayerSlot player={players[0]} />
          <PlayerSlot onInvite={() => alert('Friend invitation sent!')} />
        </div>

        {/* Room Code with Copy & Share */}
        <RoomCode code="384921" />

        {/* Voice, Ping & Chat Indicators */}
        <div className="flex items-center justify-between w-full">
          <VoiceIndicator />
          <PingIndicator pingMs={28} />
          <button
            onClick={() => alert('Quick Chat: Hello 👋 Ready? Good Luck!')}
            className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-200 font-extrabold text-xs flex items-center gap-1 shadow hover:text-white transition-colors cursor-pointer"
          >
            <span>💬 Chat</span>
          </button>
        </div>
      </div>

      {/* Countdown Overlay or Ready Button */}
      <div className="w-full max-w-md z-10 mb-2">
        {countdown !== null ? (
          <div className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 border-2 border-yellow-200 text-slate-950 font-black text-2xl tracking-widest text-center shadow-2xl animate-pulse">
            🚀 STARTING IN {countdown}...
          </div>
        ) : (
          <ReadyButton isReady={isReady} onToggleReady={handleToggleReady} />
        )}
      </div>
    </div>
  );
};
