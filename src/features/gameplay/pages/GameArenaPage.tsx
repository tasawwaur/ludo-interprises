import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../../store/game.store';
import { useUserStore } from '../../../user/user.store';
import { LudoCanvasBoard } from '../components/LudoCanvasBoard';
import { CornerPlayerAvatar } from '../components/CornerPlayerAvatar';
import { ChatModal } from '../../chat/ChatModal';
import { ExitConfirmModal } from '../components/ExitConfirmModal';
import { LudoPageBackground } from '../../../components/effects/LudoPageBackground';

interface GameArenaPageProps {
  onLeaveGame: () => void;
  onShowMatchResult?: () => void;
}

export const GameArenaPage: React.FC<GameArenaPageProps> = ({ onLeaveGame, onShowMatchResult }) => {
  const gameState = useGameStore((s) => s.gameState);
  const startMatch = useGameStore((s) => s.startMatch);
  const rollDice = useGameStore((s) => s.rollDice);
  const resetMatch = useGameStore((s) => s.resetMatch);
  const turnTimerSeconds = useGameStore((s) => s.turnTimerSeconds);
  const isAutoMode = useGameStore((s) => s.isAutoMode);
  const disableAutoMode = useGameStore((s) => s.disableAutoMode);
  const tickTurnTimer = useGameStore((s) => s.tickTurnTimer);
  const user = useUserStore((s) => s.user);

  const [activeSpeechBubbles, setActiveSpeechBubbles] = useState<Record<string, string | null>>({});
  const [showExitModal, setShowExitModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    if (!gameState) {
      startMatch('4P', user?.username || 'Govind');
    }
  }, [gameState, startMatch, user]);

  // Turn Timer Countdown Loop
  useEffect(() => {
    if (!gameState || gameState.gameStatus === 'GAME_OVER') return;

    const interval = setInterval(() => {
      tickTurnTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, tickTurnTimer]);

  if (!gameState) return null;

  const greenPlayer = gameState.players.find((p) => p.color === 'GREEN');
  const yellowPlayer = gameState.players.find((p) => p.color === 'YELLOW');
  const bluePlayer = gameState.players.find((p) => p.color === 'BLUE');
  const redPlayer = gameState.players.find((p) => p.color === 'RED');

  const handleSendMessage = (msg: string) => {
    const activeCol = activePlayer?.color || 'GREEN';
    setActiveSpeechBubbles((prev) => ({ ...prev, [activeCol]: msg }));
    setTimeout(() => {
      setActiveSpeechBubbles((prev) => ({ ...prev, [activeCol]: null }));
    }, 2800);
  };

  const activePlayer = gameState.players[gameState.activePlayerIndex];

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Background */}
      <LudoPageBackground variant="gameplay" />
      <div className="w-full max-w-[430px] h-screen flex flex-col justify-between relative z-10 px-3 py-3">
        {/* Header Bar (Matching Image #4) */}
        <div className="flex items-center justify-between bg-black/40 p-2 rounded-2xl border border-purple-500/30">
          <button
            onClick={() => setShowExitModal(true)}
            className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-sm"
          >
            ☰
          </button>

          {/* Time & Pot Info */}
          <div className="flex items-center gap-3">
            <div className="bg-black/60 px-3 py-1 rounded-full border border-green-500/40 text-center">
              <span className="text-[9px] text-gray-400 block">Time</span>
              <span className="text-xs font-black text-green-400 font-mono">00:28</span>
            </div>
            <div className="bg-black/60 px-3 py-1 rounded-full border border-amber-400/40 text-center">
              <span className="text-[9px] text-gray-400 block">Pot</span>
              <span className="text-xs font-black text-amber-400 font-mono">₹10,000</span>
            </div>
          </div>

          <button
            onClick={() => setShowExitModal(true)}
            className="w-8 h-8 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-sm"
          >
            ⚙️
          </button>
        </div>

        {/* TOP PLAYER PROFILES ROW */}
        <div className="flex justify-between items-center my-1 px-1">
          <div className="min-w-[100px]">
            {greenPlayer && (
              <CornerPlayerAvatar
                player={greenPlayer}
                isActive={activePlayer?.color === 'GREEN'}
                diceValue={gameState.currentTurnColor === 'GREEN' ? gameState.diceValue : null}
                isDiceRolled={gameState.isDiceRolled}
                canRoll={activePlayer?.color === 'GREEN' && !greenPlayer.isAi && gameState.gameStatus === 'ROLL_WAIT'}
                turnTimerSeconds={activePlayer?.color === 'GREEN' ? turnTimerSeconds : 15}
                isAutoMode={activePlayer?.color === 'GREEN' && isAutoMode}
                chatBubbleMessage={activeSpeechBubbles['GREEN']}
                onRollDice={rollDice}
                onSendGift={() => handleSendMessage('🎁 Gift Sent!')}
                onDisableAutoMode={disableAutoMode}
                position="top-left"
              />
            )}
          </div>

          <div className="min-w-[100px]">
            {yellowPlayer && (
              <CornerPlayerAvatar
                player={yellowPlayer}
                isActive={activePlayer?.color === 'YELLOW'}
                diceValue={gameState.currentTurnColor === 'YELLOW' ? gameState.diceValue : null}
                isDiceRolled={gameState.isDiceRolled}
                canRoll={activePlayer?.color === 'YELLOW' && !yellowPlayer.isAi && gameState.gameStatus === 'ROLL_WAIT'}
                turnTimerSeconds={activePlayer?.color === 'YELLOW' ? turnTimerSeconds : 15}
                isAutoMode={activePlayer?.color === 'YELLOW' && isAutoMode}
                chatBubbleMessage={activeSpeechBubbles['YELLOW']}
                onRollDice={rollDice}
                onSendGift={() => handleSendMessage('🎁 Gift Sent!')}
                onDisableAutoMode={disableAutoMode}
                position="top-right"
              />
            )}
          </div>
        </div>

        {/* CENTER: LUDO CANVAS BOARD */}
        <div className="flex justify-center my-1">
          <LudoCanvasBoard />
        </div>

        {/* BOTTOM PLAYER PROFILES ROW */}
        <div className="flex justify-between items-center my-1 px-1">
          <div className="min-w-[100px]">
            {redPlayer && (
              <CornerPlayerAvatar
                player={redPlayer}
                isActive={activePlayer?.color === 'RED'}
                diceValue={gameState.currentTurnColor === 'RED' ? gameState.diceValue : null}
                isDiceRolled={gameState.isDiceRolled}
                canRoll={activePlayer?.color === 'RED' && !redPlayer.isAi && gameState.gameStatus === 'ROLL_WAIT'}
                turnTimerSeconds={activePlayer?.color === 'RED' ? turnTimerSeconds : 15}
                isAutoMode={activePlayer?.color === 'RED' && isAutoMode}
                chatBubbleMessage={activeSpeechBubbles['RED']}
                onRollDice={rollDice}
                onSendGift={() => handleSendMessage('🎁 Gift Sent!')}
                onDisableAutoMode={disableAutoMode}
                position="bottom-left"
              />
            )}
          </div>

          {/* Big Center Roll Button */}
          <button
            onClick={() => rollDice()}
            disabled={gameState.gameStatus !== 'ROLL_WAIT'}
            className="w-16 h-16 rounded-2xl bg-gradient-to-b from-green-400 to-emerald-600 border-2 border-green-200 text-slate-950 font-black text-xs uppercase flex flex-col items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.5)] active:scale-95 transition-transform"
          >
            <span className="text-xl">🎲</span>
            <span>ROLL</span>
          </button>

          <div className="min-w-[100px]">
            {bluePlayer && (
              <CornerPlayerAvatar
                player={bluePlayer}
                isActive={activePlayer?.color === 'BLUE'}
                diceValue={gameState.currentTurnColor === 'BLUE' ? gameState.diceValue : null}
                isDiceRolled={gameState.isDiceRolled}
                canRoll={activePlayer?.color === 'BLUE' && !bluePlayer.isAi && gameState.gameStatus === 'ROLL_WAIT'}
                turnTimerSeconds={activePlayer?.color === 'BLUE' ? turnTimerSeconds : 15}
                isAutoMode={activePlayer?.color === 'BLUE' && isAutoMode}
                chatBubbleMessage={activeSpeechBubbles['BLUE']}
                onRollDice={rollDice}
                onSendGift={() => handleSendMessage('🎁 Gift Sent!')}
                onDisableAutoMode={disableAutoMode}
                position="bottom-right"
              />
            )}
          </div>
        </div>

        {/* Bottom Chat Bar (Matching Image #4) */}
        <div className="flex items-center gap-2 bg-black/40 p-2 rounded-2xl border border-purple-500/30">
          <button
            onClick={() => setShowChatModal(true)}
            className="w-8 h-8 rounded-full bg-purple-950 border border-purple-500/40 flex items-center justify-center text-base"
          >
            😃
          </button>

          <input
            type="text"
            placeholder="Tap to Chat"
            onClick={() => setShowChatModal(true)}
            readOnly
            className="flex-1 bg-black/50 border border-purple-500/20 rounded-xl px-3 py-1.5 text-xs text-gray-300 cursor-pointer"
          />

          <button
            onClick={() => setShowChatModal(true)}
            className="w-8 h-8 rounded-full bg-purple-950 border border-purple-500/40 flex items-center justify-center text-base"
          >
            🎙️
          </button>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      <ExitConfirmModal
        isOpen={showExitModal}
        onCancel={() => setShowExitModal(false)}
        onConfirmExit={() => {
          setShowExitModal(false);
          resetMatch();
          onLeaveGame();
        }}
      />

      {/* Chat Modal */}
      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};
