import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../../store/game.store';
import { useUserStore } from '../../../user/user.store';
import { LudoCanvasBoard } from '../components/LudoCanvasBoard';
import { CornerPlayerAvatar } from '../components/CornerPlayerAvatar';
import { ChatModal } from '../../chat/ChatModal';
import { DiceFace } from '../components/DiceFace';
import { ExitConfirmModal } from '../components/ExitConfirmModal';
import { LudoPageBackground } from '../../../components/effects/LudoPageBackground';
import { useRoomStore } from '../../../features/matchmaking/rooms/RoomStore';

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
  const maxPlayers = useRoomStore((s) => s.maxPlayers);

  const [activeSpeechBubbles, setActiveSpeechBubbles] = useState<Record<string, string | null>>({});
  const [showExitModal, setShowExitModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    if (!gameState) {
      startMatch(maxPlayers === 2 ? '2P' : '4P', user?.username || 'Govind');
    }
  }, [gameState, startMatch, user, maxPlayers]);

  const updateUser = useUserStore((s) => s.updateUser);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  // Match Victory Prize Reward (9,500 Coins for Winner)
  useEffect(() => {
    if (gameState?.gameStatus === 'GAME_OVER' && !rewardClaimed) {
      const winnerColor = gameState.winnerRankings[0];
      const winningPlayer = gameState.players.find((p) => p.color === winnerColor);
      
      // If Host / User won the match, credit 9,500 coins to their wallet!
      if (winningPlayer?.isHost || winningPlayer?.color === 'GREEN') {
        const currentCoins = user?.coins || 0;
        updateUser({ coins: currentCoins + 9500 });
        setRewardClaimed(true);
      }
    }
  }, [gameState?.gameStatus, gameState?.winnerRankings, rewardClaimed, user?.coins, updateUser]);

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
      
      {/* 2. FIXED CENTER: 3D GOLDEN LUDO BOARD (Fixed 100% in exact dead-center) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="w-[360px] max-w-[95vw] relative flex items-center justify-center">
          <img
            src="/assets/images/backgrounds/luxury_ludo_board.png"
            alt="Golden Luxury Ludo Board"
            className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] select-none"
            draggable={false}
          />
        </div>
      </div>

      {/* 3. FIXED OVERLAY UI LAYER (Fixed absolute coordinate slots) */}
      <div className="w-full max-w-[430px] h-screen relative z-20 overflow-hidden">
        {/* PLAYER 2 PROFILE: FIXED TOP-RIGHT (Opponent: Read-only mic status) */}
        <div className="absolute top-12 right-3 z-20">
          <div className="min-w-[98px]">
            {yellowPlayer && (
              <CornerPlayerAvatar
                player={yellowPlayer}
                isActive={activePlayer?.color === 'YELLOW'}
                diceValue={gameState.currentTurnColor === 'YELLOW' ? gameState.diceValue : null}
                isDiceRolled={gameState.isDiceRolled}
                canRoll={false}
                turnTimerSeconds={activePlayer?.color === 'YELLOW' ? turnTimerSeconds : 15}
                isAutoMode={false}
                chatBubbleMessage={activeSpeechBubbles['YELLOW']}
                onRollDice={rollDice}
                onSendGift={() => handleSendMessage('🎁 Gift Sent!')}
                onDisableAutoMode={disableAutoMode}
                onOpenChat={() => setShowChatModal(true)}
                position="top-right"
                isLocalPlayer={false}
                remoteMicStatus={false}
              />
            )}
          </div>
        </div>

        {/* PLAYER 1 PROFILE: FIXED BOTTOM-LEFT (Local User: Full mic control) */}
        <div className="absolute bottom-[76px] left-3 z-20">
          <div className="min-w-[98px]">
            {greenPlayer && (
              <CornerPlayerAvatar
                player={greenPlayer}
                isActive={activePlayer?.color === 'GREEN'}
                diceValue={gameState.currentTurnColor === 'GREEN' ? gameState.diceValue : null}
                isDiceRolled={gameState.isDiceRolled}
                canRoll={false}
                turnTimerSeconds={activePlayer?.color === 'GREEN' ? turnTimerSeconds : 15}
                isAutoMode={false}
                chatBubbleMessage={activeSpeechBubbles['GREEN']}
                onRollDice={rollDice}
                onSendGift={() => handleSendMessage('🎁 Gift Sent!')}
                onDisableAutoMode={disableAutoMode}
                onOpenChat={() => setShowChatModal(true)}
                position="bottom-left"
                isLocalPlayer={true}
              />
            )}
          </div>
        </div>

        {/* LUXURY CHAT BUTTON: FIXED BOTTOM RIGHT (10% higher, 50% smaller) */}
        <div className="absolute bottom-12 right-3 z-30 flex items-center justify-center">
          <button
            onClick={() => setShowChatModal(true)}
            className="w-7 h-7 relative hover:scale-110 active:scale-90 transition-transform cursor-pointer filter drop-shadow-[0_4px_10px_rgba(234,179,8,0.7)]"
            title="Open Chat"
          >
            <img
              src="/assets/images/icons/luxury_chat_button.png"
              alt="Chat"
              className="w-full h-full object-contain pointer-events-none"
              draggable={false}
            />
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
