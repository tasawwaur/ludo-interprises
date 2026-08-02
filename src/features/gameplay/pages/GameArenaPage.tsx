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
import { getGridPos, OUTER_TRACK_COORDS } from '../../../game/board/BoardCoordinates';
import { ProtectButton } from '../components/ProtectButton';
import { LuxuryLiveCamera } from '../../../components/camera/LuxuryLiveCamera';


interface GameArenaPageProps {
  onLeaveGame: () => void;
  onShowMatchResult?: () => void;
}

export const GameArenaPage: React.FC<GameArenaPageProps> = ({ onLeaveGame, onShowMatchResult }) => {
  const gameState = useGameStore((s) => s.gameState);
  const localPlayerColor = useGameStore((s) => s.localPlayerColor);
  const startMatch = useGameStore((s) => s.startMatch);
  const rollDice = useGameStore((s) => s.rollDice);
  const resetMatch = useGameStore((s) => s.resetMatch);
  const moveToken = useGameStore((s) => s.moveToken);
  const turnTimerSeconds = useGameStore((s) => s.turnTimerSeconds);
  const isAutoMode = useGameStore((s) => s.isAutoMode);
  const disableAutoMode = useGameStore((s) => s.disableAutoMode);
  const tickTurnTimer = useGameStore((s) => s.tickTurnTimer);
  const demoStack = useGameStore((s) => s.demoStack);
  const connectGameSocket = useGameStore((s) => s.connectGameSocket);
  const disconnectGameSocket = useGameStore((s) => s.disconnectGameSocket);
  const user = useUserStore((s) => s.user);
  const maxPlayers = useRoomStore((s) => s.maxPlayers);
  const useCanvasBoard = true;

  // Connect authoritative game socket for online matchmaking matches
  useEffect(() => {
    const roomCode = useRoomStore.getState().roomCode;
    if (roomCode) {
      connectGameSocket(roomCode);
    }
    return () => {
      disconnectGameSocket();
    };
  }, [connectGameSocket, disconnectGameSocket]);

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
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isVibrate, setIsVibrate] = useState(true);
  const isMuted = useGameStore((s) => s.isMuted);
  const toggleMute = useGameStore((s) => s.toggleMute);

  const handleVibrateToggle = () => {
    const nextVal = !isVibrate;
    setIsVibrate(nextVal);
    if (nextVal && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  const [dragPositions, setDragPositions] = useState<Record<string, { top: string; left: string }>>({});
  const [activeDragTokenId, setActiveDragTokenId] = useState<string | null>(null);

  const handleMouseDown = (e: React.MouseEvent, tokenId: string) => {
    e.preventDefault();
    setActiveDragTokenId(tokenId);
  };

  useEffect(() => {
    if (!activeDragTokenId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const boardContainer = document.querySelector('.w-\\[360px\\].max-w-\\[95vw\\].relative');
      if (!boardContainer) return;

      const rect = boardContainer.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const leftPct = `${((x / rect.width) * 100).toFixed(2)}%`;
      const topPct = `${((y / rect.height) * 100).toFixed(2)}%`;

      setDragPositions(prev => ({
        ...prev,
        [activeDragTokenId]: { top: topPct, left: leftPct }
      }));
    };

    const handleMouseUp = () => {
      setActiveDragTokenId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDragTokenId]);

  const localPlayer = gameState?.players.find(p => p.color === localPlayerColor) || gameState?.players[0];
  const opponentPlayer = gameState?.players.find(p => p.color !== localPlayerColor) || gameState?.players[1];

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
      if (winningPlayer?.isHost || winningPlayer?.color === localPlayer?.color) {
        const currentCoins = user?.coins || 0;
        updateUser({ coins: currentCoins + 9500 });
        setRewardClaimed(true);
      }
    }
  }, [gameState?.gameStatus, gameState?.winnerRankings, rewardClaimed, user?.coins, updateUser, localPlayer?.color]);

  // Auto transition to MatchResultScreen after 4 seconds when game is over
  useEffect(() => {
    if (gameState?.gameStatus === 'GAME_OVER') {
      const timer = setTimeout(() => {
        onLeaveGame();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.gameStatus, onLeaveGame]);

  // Turn Timer Countdown Loop
  useEffect(() => {
    if (!gameState || gameState.gameStatus === 'GAME_OVER') return;

    const interval = setInterval(() => {
      tickTurnTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, tickTurnTimer]);

  if (!gameState) return null;

  const activePlayer = gameState.players[gameState.activePlayerIndex];

  const handleSendMessage = (msg: string) => {
    const activeCol = activePlayer?.color || localPlayer?.color || 'BLUE';
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

  const getFrameImage = (color: string | undefined): string => {
    if (!color) return '/assets/images/icons/cyan_royal_frame.png';
    const frameMap: Record<string, string> = {
      RED: '/assets/images/icons/red_royal_frame.png',
      GREEN: '/assets/images/icons/green_royal_frame.png',
      YELLOW: '/assets/images/icons/gold_royal_frame.png',
      BLUE: '/assets/images/icons/cyan_royal_frame.png',
    };
    return frameMap[color] || '/assets/images/icons/cyan_royal_frame.png';
  };

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col items-center relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Background */}
      <LudoPageBackground variant="gameplay" />
      
      {/* 2. FIXED CENTER: 3D GOLDEN LUDO BOARD & TOP/BOTTOM ROYAL CARD SLOTS */}
      <div className="absolute inset-0 flex items-center justify-center z-20 translate-y-2 pointer-events-none">
        <div className="w-[360px] max-w-[95vw] relative flex items-center justify-center pointer-events-none">
          {useCanvasBoard ? (
            <div className="w-full pointer-events-auto filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)]">
              <LudoCanvasBoard />
            </div>
          ) : (
            <>
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

              {/* Gold Royal Frame: Yellow House (PERFECT LOCKED POSITION) */}
              <div className="absolute bottom-[105px] right-[20px] w-[121px] h-[134px] pointer-events-none z-15">
                <img
                  src="/assets/images/icons/gold_royal_frame.png"
                  alt="Gold Royal Frame on Yellow House"
                  className="w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.9)]"
                />
              </div>

              {/* 8 SAFE STOPS 3D LUXURY STAR ICONS (PERFECTLY LOCKED ALIGNED) */}
              {/* Star 1: Green Start */}
              <div className="absolute top-[45.2%] left-[18%] -translate-x-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center z-25 pointer-events-none">
                <img src="/assets/images/icons/luxury_star_icon.png" alt="Star 1" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
              </div>

              {/* Star 2: Green Track Safe */}
              <div className="absolute top-[52.8%] left-[23%] -translate-x-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center z-25 pointer-events-none">
                <img src="/assets/images/icons/luxury_star_icon.png" alt="Star 2" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
              </div>

              {/* Star 3: Yellow Start */}
              <div className="absolute top-[27%] left-[56.2%] -translate-x-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center z-25 pointer-events-none">
                <img src="/assets/images/icons/luxury_star_icon.png" alt="Star 3" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
              </div>

              {/* Star 4: Yellow Track Safe */}
              <div className="absolute top-[30.5%] left-[43.8%] -translate-x-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center z-25 pointer-events-none">
                <img src="/assets/images/icons/luxury_star_icon.png" alt="Star 4" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
              </div>

              {/* Star 5: Blue Start */}
              <div className="absolute top-[52.5%] left-[82%] -translate-x-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center z-25 pointer-events-none">
                <img src="/assets/images/icons/luxury_star_icon.png" alt="Star 5" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
              </div>

              {/* Star 6: Blue Track Safe */}
              <div className="absolute top-[45.2%] left-[76.6%] -translate-x-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center z-25 pointer-events-none">
                <img src="/assets/images/icons/luxury_star_icon.png" alt="Star 6" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
              </div>

              {/* Star 7: Red Start */}
              <div className="absolute top-[71.5%] left-[43.8%] -translate-x-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center z-25 pointer-events-none">
                <img src="/assets/images/icons/luxury_star_icon.png" alt="Star 7" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
              </div>

              {/* Star 8: Red Track Safe */}
              <div className="absolute top-[68%] left-[56.2%] -translate-x-1/2 -translate-y-1/2 w-[20px] h-[20px] flex items-center justify-center z-25 pointer-events-none">
                <img src="/assets/images/icons/luxury_star_icon.png" alt="Star 8" className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.95)]" />
              </div>

              {/* DYNAMIC PLAYER COLOR SCAN & HOUSE TOKEN RENDER ENGINE */}
              {gameState?.players.map((player) => {
                const tokenAssetMap: Record<string, string> = {
                  RED: '/assets/images/icons/token_red_3d.png',
                  GREEN: '/assets/images/icons/token_green_3d.png',
                  YELLOW: '/assets/images/icons/token_yellow_3d.png',
                  BLUE: '/assets/images/icons/token_blue_3d.png',
                };

                // 4 Yard spot offsets for each House (Correct color alignment with background board yards)
                const houseOffsets: Record<string, Array<{ top: string; left: string }>> = {
                  RED: [
                    { top: '27.26%', left: '20.04%' },
                    { top: '27.26%', left: '28.56%' },
                    { top: '33.32%', left: '20.04%' },
                    { top: '33.32%', left: '28.56%' },
                  ],
                  GREEN: [
                    { top: '27.26%', left: '70.86%' },
                    { top: '27.26%', left: '79.38%' },
                    { top: '33.32%', left: '70.86%' },
                    { top: '33.32%', left: '79.97%' },
                  ],
                  YELLOW: [
                    { top: '61.30%', left: '70.86%' },
                    { top: '61.69%', left: '79.38%' },
                    { top: '67.56%', left: '70.86%' },
                    { top: '66.98%', left: '79.97%' },
                  ],
                  BLUE: [
                    { top: '61.30%', left: '20.04%' },
                    { top: '61.69%', left: '28.56%' },
                    { top: '67.56%', left: '20.04%' },
                    { top: '66.98%', left: '29.14%' },
                  ],
                };

                const tokenImg = tokenAssetMap[player.color];

                return (
                  <React.Fragment key={player.color}>
                    {player.tokens.map((token, idx) => {
                      const isMoveable = gameState.movableTokens.some((m) => m.tokenId === token.id);
                      
                      // Calculate dynamic positions
                      let positionStyle: { top: string; left: string };
                      if (dragPositions[token.id]) {
                        positionStyle = dragPositions[token.id];
                      } else if (token.stepCount === 0) {
                        positionStyle = houseOffsets[player.color][token.index];
                      } else if (token.stepCount === 57) {
                        const homeOffsets: Record<string, Array<{ top: string; left: string }>> = {
                          GREEN: [
                            { top: '49.35%', left: '46.60%' },
                            { top: '49.17%', left: '50.90%' },
                            { top: '52.06%', left: '46.91%' },
                            { top: '52.55%', left: '50.83%' },
                          ],
                          YELLOW: [
                            { top: '50.65%', left: '46.60%' },
                            { top: '50.83%', left: '50.90%' },
                            { top: '47.94%', left: '46.91%' },
                            { top: '47.45%', left: '50.83%' },
                          ],
                          RED: [
                            { top: '46.60%', left: '49.35%' },
                            { top: '50.90%', left: '49.17%' },
                            { top: '47.94%', left: '46.91%' },
                            { top: '52.06%', left: '46.60%' },
                          ],
                          BLUE: [
                            { top: '46.60%', left: '50.65%' },
                            { top: '50.90%', left: '50.83%' },
                            { top: '47.94%', left: '53.09%' },
                            { top: '52.06%', left: '53.40%' },
                          ],
                        };
                        positionStyle = homeOffsets[player.color][token.index];
                      } else {
                        const gridPos = getGridPos(token.color, token.stepCount, token.index);
                        positionStyle = {
                          left: `${0.50 + (gridPos.col + 0.5) * 6.60}%`,
                          top: `${25.15 + (gridPos.row + 0.5) * 3.33}%`,
                        };
                      }

                      // Token Display Numbers: Player 1 (Host) gets 1-4, Player 2 gets 5-8, etc.
                      const playerIdx = gameState.players.findIndex((p) => p.color === player.color);
                      let displayNum = token.index + 1;
                      if (playerIdx === 1) displayNum = token.index + 5;
                      if (playerIdx === 2) displayNum = token.index + 9;
                      if (playerIdx === 3) displayNum = token.index + 13;

                      const translateClass = '-translate-y-1/2';

                      // Render number badges on all active players' tokens in the match
                      const showNumber = true;

                      const badgeColors: Record<string, string> = {
                        GREEN: '#16a34a',
                        BLUE: '#2563eb',
                        YELLOW: '#ca8a04',
                        RED: '#dc2626',
                      };

                      return (
                        <div
                          key={token.id}
                          onMouseDown={(e) => handleMouseDown(e, token.id)}
                          onClick={() => {
                            if (isMoveable) {
                              moveToken(token.id);
                            }
                          }}
                          className={`absolute -translate-x-1/2 ${translateClass} w-[24px] h-[31px] z-30 flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] transition-all duration-200 pointer-events-auto ${
                            isMoveable
                              ? 'cursor-pointer hover:scale-125 active:scale-95 ring-4 ring-yellow-400 ring-offset-1 rounded-full animate-bounce shadow-[0_0_15px_rgba(251,191,36,0.9)] z-40'
                              : 'cursor-grab active:cursor-grabbing'
                          }`}
                          style={{
                            top: positionStyle.top,
                            left: positionStyle.left,
                          }}
                        >
                          <img src={tokenImg} alt={`${token.color} Token ${idx + 1}`} className="w-full h-full object-contain" />
                          
                          {showNumber && (
                            <div 
                              className="absolute -top-[12px] w-[18px] h-[18px] rounded-full flex items-center justify-center border-[1.5px] border-white shadow-[0_2px_4px_rgba(0,0,0,0.4)] font-black text-[9px] text-white z-50 select-none pointer-events-none"
                              style={{
                                backgroundColor: badgeColors[token.color] || '#2563eb'
                              }}
                            >
                              {displayNum}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </>
          )}

          {/* Top Center Royal Frame & Opponent 3D Dice */}
          <div className="absolute -top-[90px] left-1/2 -translate-x-1/2 w-[84px] h-[96px] z-50 flex items-center justify-center pointer-events-auto">
            <img
              src={getFrameImage(opponentPlayer?.color)}
              alt="Opponent Royal Frame"
              className="w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.95)] pointer-events-none"
            />
            {/* 3D Dice inside Green Frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50">
              <Royal3DDice
                value={opponentPlayer && gameState.currentTurnColor === opponentPlayer.color ? gameState.diceValue : null}
                isActiveTurn={opponentPlayer && gameState.currentTurnColor === opponentPlayer.color}
                canRoll={false}
                size={54}
                playerColor={opponentPlayer?.color}
                badgePosition="left"
              />
            </div>
          </div>

          {/* 🛡️ PROTECT BUTTON — Centered between bottom-left profile & bottom-center dice */}
          <div
            className="absolute z-50 pointer-events-auto"
            style={{
              bottom: '-74px',
              left: '35%',
              transform: 'translateX(-50%) scale(0.42)',
              transformOrigin: 'center center',
            }}
          >
            <ProtectButton localPlayer={localPlayer} gameState={gameState} />
          </div>

          {/* Bottom Center Royal Frame & Local User 3D Dice */}
          <div className="absolute -bottom-[100px] left-1/2 -translate-x-1/2 w-[84px] h-[96px] z-50 flex items-center justify-center pointer-events-auto">
            <img
              src={getFrameImage(localPlayer?.color)}
              alt="Local Royal Frame"
              className="w-full h-full object-contain filter drop-shadow-[0_6px_14px_rgba(0,0,0,0.95)] pointer-events-none"
            />
            {/* 3D Dice inside Cyan Frame */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto z-50">
              <Royal3DDice
                value={localPlayer && gameState.currentTurnColor === localPlayer.color ? gameState.diceValue : null}
                isActiveTurn={localPlayer && gameState.currentTurnColor === localPlayer.color}
                canRoll={
                  !!(localPlayer &&
                  gameState.currentTurnColor === localPlayer.color &&
                  gameState.gameStatus === 'ROLL_WAIT' &&
                  !gameState.isDiceRolled)
                }
                onRoll={rollDice}
                size={54}
                playerColor={localPlayer?.color}
                badgePosition="right"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 3. FIXED OVERLAY UI LAYER (Fixed absolute coordinate slots) */}
      <div className="w-full max-w-[430px] h-screen relative z-20 overflow-hidden pointer-events-none">

        {/* HAMBURGER MENU BUTTON: FIXED TOP-LEFT */}
        <div className="absolute top-5 left-3 z-30 pointer-events-auto">
          <button
            onClick={() => setShowMenu(true)}
            className="w-8 h-8 rounded-lg bg-purple-950/80 border border-amber-400/30 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
            title="Open Menu"
          >
            <span className="text-md text-amber-300 font-bold">☰</span>
          </button>
        </div>

        {/* PLAYER 2 PROFILE: FIXED TOP-RIGHT (Opponent: Read-only mic status) */}
        <div className="absolute top-12 right-3 z-20 pointer-events-auto">
          <div className="min-w-[98px]">
            {opponentPlayer && (
              <CornerPlayerAvatar
                player={opponentPlayer}
                isActive={activePlayer?.color === opponentPlayer.color}
                diceValue={gameState.currentTurnColor === opponentPlayer.color ? gameState.diceValue : null}
                isDiceRolled={gameState.isDiceRolled}
                canRoll={false}
                turnTimerSeconds={activePlayer?.color === opponentPlayer.color ? turnTimerSeconds : 15}
                isAutoMode={false}
                chatBubbleMessage={activeSpeechBubbles[opponentPlayer.color]}
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
        <div className="absolute bottom-[45px] left-3 z-20 pointer-events-auto">
          <div className="min-w-[98px]">
            {localPlayer && (
              <CornerPlayerAvatar
                player={localPlayer}
                isActive={activePlayer?.color === localPlayer.color}
                diceValue={gameState.currentTurnColor === localPlayer.color ? gameState.diceValue : null}
                isDiceRolled={gameState.isDiceRolled}
                canRoll={false}
                turnTimerSeconds={activePlayer?.color === localPlayer.color ? turnTimerSeconds : 15}
                isAutoMode={false}
                chatBubbleMessage={activeSpeechBubbles[localPlayer.color]}
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

      {/* Gameplay Settings Dropdown Menu */}
      {showMenu && (
        <div className="absolute inset-0 bg-transparent z-50 pointer-events-auto" onClick={() => setShowMenu(false)}>
          {/* Menu Dropdown Card */}
          <div 
            className="absolute top-14 left-3 w-[155px] bg-[#12061F]/95 backdrop-blur-md border border-amber-400/25 p-2.5 rounded-xl flex flex-col gap-2 shadow-2xl z-50 pointer-events-auto animate-[fadeIn_0.15s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-1 border-b border-purple-500/20">
              <h3 className="text-[9px] font-black text-amber-400 tracking-wider">GAME OPTIONS</h3>
              <button
                onClick={() => setShowMenu(false)}
                className="text-[9px] text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Sounds Toggle */}
            <div className="flex justify-between items-center bg-purple-950/40 px-2 py-1 rounded-md border border-purple-500/10">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{isMuted ? "🔇" : "🔊"}</span>
                <span className="text-[9px] font-bold text-gray-200">Sounds</span>
              </div>
              <button
                onClick={() => {
                  toggleMute();
                  if (isVibrate && typeof navigator !== "undefined" && navigator.vibrate) {
                    navigator.vibrate(50);
                  }
                }}
                className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                  !isMuted ? "bg-amber-400" : "bg-purple-950"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    !isMuted ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Vibration Toggle */}
            <div className="flex justify-between items-center bg-purple-950/40 px-2 py-1 rounded-md border border-purple-500/10">
              <div className="flex items-center gap-1.5">
                <span className="text-xs">📳</span>
                <span className="text-[9px] font-bold text-gray-200">Vibrate</span>
              </div>
              <button
                onClick={handleVibrateToggle}
                className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                  isVibrate ? "bg-amber-400" : "bg-purple-950"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    isVibrate ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Actions Row */}
            <div className="flex items-center gap-1.5 mt-0.5">
              {/* Rules Info Button */}
              <button
                onClick={() => setShowRulesModal(true)}
                className="w-7 h-7 rounded-md bg-amber-400/20 hover:bg-amber-400/30 active:scale-95 transition-transform border border-amber-400/35 flex items-center justify-center text-amber-300 font-black text-xs"
                title="Game Rules"
              >
                ℹ️
              </button>

              {/* Fast Win Button */}
              <button
                onClick={() => {
                  demoStack();
                  setShowMenu(false);
                }}
                className="w-7 h-7 rounded-md bg-green-500/20 hover:bg-green-500/30 active:scale-95 transition-transform border border-green-500/35 flex items-center justify-center text-green-300 font-black text-xs"
                title="Demo Fast Win"
              >
                ⚡
              </button>

              {/* Exit Button */}
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowExitModal(true);
                }}
                className="flex-1 py-1.5 bg-red-600/20 hover:bg-red-600/30 active:scale-95 transition-transform border border-red-500/35 rounded-md text-red-400 font-black text-[9px] tracking-wider uppercase flex items-center justify-center gap-1"
              >
                🚪 EXIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Rules Modal */}
      {showRulesModal && (
        <div className="absolute inset-0 bg-black/70 z-55 flex items-center justify-center p-4 pointer-events-auto">
          <div className="w-full max-w-[260px] bg-[#12061F]/95 backdrop-blur-md border border-amber-400/30 rounded-2xl p-4.5 shadow-2xl flex flex-col gap-3.5 relative">
            {/* Header */}
            <div className="flex justify-between items-center pb-2 border-b border-purple-500/20">
              <h3 className="text-xs font-black text-amber-400 tracking-wider">📜 GAME RULES</h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-6 h-6 rounded-full bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Rules List */}
            <div className="flex flex-col gap-2.5">
              <div className="bg-[#090212] border border-amber-400/10 rounded-lg p-2">
                <h4 className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1.5">XP Rewards</h4>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[9px] border-b border-purple-500/5 pb-0.5">
                    <span className="text-gray-300">⚔️ Token Kill</span>
                    <span className="text-emerald-400 font-black">+10 XP</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] border-b border-purple-500/5 pb-0.5">
                    <span className="text-gray-300">🏁 Token Win</span>
                    <span className="text-emerald-400 font-black">+50 XP</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-gray-300">🎲 Six Roll</span>
                    <span className="text-amber-400 font-black">Extra Turn</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#090212] border border-red-500/15 rounded-lg p-2">
                <h4 className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1.5">Violations</h4>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[9px] border-b border-purple-500/5 pb-0.5">
                    <span className="text-gray-300">🎰 3x Sixes</span>
                    <span className="text-red-400 font-black">Forfeit</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px] border-b border-purple-500/5 pb-0.5">
                    <span className="text-gray-300">⏱️ Timeout</span>
                    <span className="text-red-400 font-black">Auto-Play</span>
                  </div>
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-gray-300">🚪 Quit Match</span>
                    <span className="text-red-400 font-black">Forfeit</span>
                  </div>
                </div>
              </div>
            </div>

            {/* OK Button */}
            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2 bg-amber-400/20 hover:bg-amber-400/30 active:scale-95 transition-transform border border-amber-400/40 rounded-lg text-amber-400 font-black text-[10px] tracking-wider uppercase"
            >
              OK
            </button>
          </div>
        </div>
      )}

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

      {/* Luxury 1v1 Live Camera overlay */}
      {maxPlayers === 2 && (() => {
        const localUser = useUserStore.getState().user;
        const opponent = gameState?.players.find(p => p.color !== localPlayerColor);
        
        return (
          <LuxuryLiveCamera
            localPlayerName={localUser?.displayName || localUser?.username || "You"}
            localPlayerAvatar={localUser?.avatar || "/assets/images/icons/icon_club_crown.png"}
            opponentName={opponent?.name || "Opponent"}
            opponentAvatar={opponent?.avatar || "/assets/images/icons/profile_frame_v3.png"}
            isOneVsOne={maxPlayers === 2}
          />
        );
      })()}
    </div>
  );
};
