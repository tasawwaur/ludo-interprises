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
import { Royal3DDice } from '../components/Royal3DDice';

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

  interface ChatMessageItem {
    id: string;
    sender: string;
    text: string;
    time: string;
    color?: string;
  }

  const [chatHistory, setChatHistory] = useState<ChatMessageItem[]>([]);
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

  const activePlayer = gameState.players[gameState.activePlayerIndex];

  const handleSendMessage = (msg: string) => {
    const activeCol = activePlayer?.color || 'GREEN';
    const senderName = activePlayer?.name || user?.username || 'You';
    
    // Add to chat history
    const newMsgItem: ChatMessageItem = {
      id: Date.now().toString() + Math.random().toString().slice(2, 5),
      sender: senderName,
      text: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: activeCol,
    };

    setChatHistory((prev) => [...prev.slice(-15), newMsgItem]);

    setActiveSpeechBubbles((prev) => ({ ...prev, [activeCol]: msg }));
    setTimeout(() => {
      setActiveSpeechBubbles((prev) => ({ ...prev, [activeCol]: null }));
    }, 2800);
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Background */}
      <LudoPageBackground variant="gameplay" />
      
      {/* 2. FIXED CENTER: 3D GOLDEN LUDO BOARD & TOP/BOTTOM ROYAL CARD SLOTS */}
      <div className="absolute inset-0 flex items-center justify-center z-20 -translate-y-4 pointer-events-none">
        <div className="w-[360px] max-w-[95vw] relative flex items-center justify-center pointer-events-none">
          <img
            src="/assets/images/backgrounds/luxury_ludo_board.png"
            alt="Golden Luxury Ludo Board"
            className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] select-none pointer-events-none"
            draggable={false}
          />
          {/* Red Royal Frame: Red House (PERFECT POSITION) */}
          <div className="absolute top-[90px] left-[25px] w-[121px] h-[134px] pointer-events-none z-15">
            <img
              src="/assets/images/icons/red_royal_frame.png"
              alt="Red Royal Frame on Red House"
              className="w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.9)]"
            />
          </div>

          {/* Gold Royal Frame: Yellow House (Shifted 40% Up) */}
          <div className="absolute bottom-[105px] right-[20px] w-[121px] h-[134px] pointer-events-none z-15">
            <img
              src="/assets/images/icons/gold_royal_frame.png"
              alt="Gold Royal Frame on Yellow House"
              className="w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.9)]"
            />
          </div>

          {/* 8 SAFE STOPS 3D LUXURY STAR ICONS (Live Screenshot Exact Alignment) */}
          {/* Green Start: Col 1, Row 6 (Top-Left Arm Start) */}
          <div className="absolute top-[43%] left-[10.5%] -translate-x-1/2 -translate-y-1/2 w-[22px] h-[22px] flex items-center justify-center z-25 pointer-events-none">
            <img src="/assets/images/icons/luxury_star_icon.png" alt="Green Start Star" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
          </div>
          {/* Green Track Safe: Col 2, Row 8 (Bottom-Left Arm Safe) */}
          <div className="absolute top-[57%] left-[17%] -translate-x-1/2 -translate-y-1/2 w-[22px] h-[22px] flex items-center justify-center z-25 pointer-events-none">
            <img src="/assets/images/icons/luxury_star_icon.png" alt="Green Track Star" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
          </div>

          {/* Yellow Start: Col 8, Row 1 (Top-Right Arm Start) */}
          <div className="absolute top-[10.5%] left-[57%] -translate-x-1/2 -translate-y-1/2 w-[22px] h-[22px] flex items-center justify-center z-25 pointer-events-none">
            <img src="/assets/images/icons/luxury_star_icon.png" alt="Yellow Start Star" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
          </div>
          {/* Yellow Track Safe: Col 6, Row 2 (Top-Left Arm Safe) */}
          <div className="absolute top-[17%] left-[43%] -translate-x-1/2 -translate-y-1/2 w-[22px] h-[22px] flex items-center justify-center z-25 pointer-events-none">
            <img src="/assets/images/icons/luxury_star_icon.png" alt="Yellow Track Star" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
          </div>

          {/* Blue Start: Col 13, Row 8 (Bottom-Right Arm Start) */}
          <div className="absolute top-[57%] left-[89.5%] -translate-x-1/2 -translate-y-1/2 w-[22px] h-[22px] flex items-center justify-center z-25 pointer-events-none">
            <img src="/assets/images/icons/luxury_star_icon.png" alt="Blue Start Star" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
          </div>
          {/* Blue Track Safe: Col 12, Row 6 (Top-Right Arm Safe) */}
          <div className="absolute top-[43%] left-[83%] -translate-x-1/2 -translate-y-1/2 w-[22px] h-[22px] flex items-center justify-center z-25 pointer-events-none">
            <img src="/assets/images/icons/luxury_star_icon.png" alt="Blue Track Star" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
          </div>

          {/* Red Start: Col 6, Row 13 (Bottom-Left Arm Start) */}
          <div className="absolute top-[89.5%] left-[43%] -translate-x-1/2 -translate-y-1/2 w-[22px] h-[22px] flex items-center justify-center z-25 pointer-events-none">
            <img src="/assets/images/icons/luxury_star_icon.png" alt="Red Start Star" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
          </div>
          {/* Red Track Safe: Col 8, Row 12 (Bottom-Right Arm Safe) */}
          <div className="absolute top-[83%] left-[57%] -translate-x-1/2 -translate-y-1/2 w-[22px] h-[22px] flex items-center justify-center z-25 pointer-events-none">
            <img src="/assets/images/icons/luxury_star_icon.png" alt="Red Track Star" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
          </div>

          {/* Top Center Green Royal Frame & Opponent 3D Dice */}
          <div className="absolute -top-[20px] left-1/2 -translate-x-1/2 w-[84px] h-[96px] z-50 flex items-center justify-center pointer-events-auto">
            <img
              src="/assets/images/icons/green_royal_frame.png"
              alt="Green Royal Frame"
              className="w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.95)] pointer-events-none"
            />
            {/* 3D Dice inside Green Frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50">
              <Royal3DDice
                value={gameState.currentTurnColor === 'YELLOW' || gameState.currentTurnColor === 'RED' ? gameState.diceValue : null}
                isActiveTurn={gameState.currentTurnColor === 'YELLOW'}
                canRoll={true}
                onRoll={rollDice}
                size={54}
              />
            </div>
          </div>

          {/* Bottom Center Cyan Royal Frame & Local User 3D Dice */}
          <div className="absolute -bottom-[20px] left-1/2 -translate-x-1/2 w-[84px] h-[96px] z-50 flex items-center justify-center pointer-events-auto">
            <img
              src="/assets/images/icons/cyan_royal_frame.png"
              alt="Cyan Royal Frame"
              className="w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.95)] pointer-events-none"
            />
            {/* 3D Dice inside Cyan Frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50">
              <Royal3DDice
                value={gameState.currentTurnColor === 'GREEN' ? gameState.diceValue : null}
                isActiveTurn={gameState.currentTurnColor === 'GREEN'}
                canRoll={true}
                onRoll={rollDice}
                size={54}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. FIXED OVERLAY UI LAYER (Fixed absolute coordinate slots) */}
      <div className="w-full max-w-[430px] h-screen relative z-20 overflow-hidden pointer-events-none">
        {/* PLAYER 2 PROFILE: FIXED TOP-RIGHT (Opponent: Read-only mic status) */}
        <div className="absolute top-12 right-3 z-20 pointer-events-auto">
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
        <div className="absolute bottom-[76px] left-3 z-20 pointer-events-auto">
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

        {/* LUXURY CHAT BUTTON: FIXED BOTTOM RIGHT (50% higher: bottom-24) */}
        <div className="absolute bottom-24 right-3 z-30 flex items-center justify-center pointer-events-auto">
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
        messages={chatHistory}
      />
    </div>
  );
};
