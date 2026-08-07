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
import { useGlobalModalStore } from '../../../store/global-modal.store';
import { SoundEngine } from '../../../game/sound/SoundEngine';


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
  const isSpectatorMode = useGameStore((s) => s.isSpectatorMode);
  const disableAutoMode = useGameStore((s) => s.disableAutoMode);
  const tickTurnTimer = useGameStore((s) => s.tickTurnTimer);
  const demoStack = useGameStore((s) => s.demoStack);
  const connectGameSocket = useGameStore((s) => s.connectGameSocket);
  const disconnectGameSocket = useGameStore((s) => s.disconnectGameSocket);
  const user = useUserStore((s) => s.user);
  const maxPlayers = useRoomStore((s) => s.maxPlayers);
  const useCanvasBoard = false;

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
    isSpectator?: boolean;
    isSystem?: boolean;
  }

  const [chatHistory, setChatHistory] = useState<ChatMessageItem[]>([]);
  const [activeSpeechBubbles, setActiveSpeechBubbles] = useState<Record<string, string | null>>({});
  const [showExitModal, setShowExitModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(() => SoundEngine.getMuteState());
  const [isVibrate, setIsVibrate] = useState(() => SoundEngine.getVibrationState());

  const handleMuteToggle = () => {
    const nextVal = SoundEngine.toggleMute();
    setIsMuted(nextVal);
  };

  const handleVibrateToggle = () => {
    const nextVal = SoundEngine.toggleVibration();
    setIsVibrate(nextVal);
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

  const defaultPlayer = {
    id: 'P1',
    name: user?.displayName || user?.username || 'Player',
    color: 'RED' as const,
    isAi: false,
    avatar: '/assets/images/icons/icon_club_crown.png',
    equippedFrameId: 'frame_default',
    tokens: [],
  } as any;

  const localUserName = user?.displayName || user?.username;
  const localPlayer = (gameState?.players ? (gameState.players.find(p => (localUserName && p.name === localUserName) || p.color === localPlayerColor) || gameState.players[0] || defaultPlayer) : defaultPlayer) as any;
  const opponentPlayer = (gameState?.players ? (gameState.players.find(p => p.color !== localPlayer?.color) || gameState.players[1] || defaultPlayer) : defaultPlayer) as any;

  const handleProfileClick = (color: string) => {
    const p = gameState?.players.find((pl) => pl.color === color);
    if (!p) return;
    const isMe = color === localPlayerColor;
    const profileId = isMe ? (user?.uid || user?.id || "Player 1") : p.name;
    useGlobalModalStore.getState().openProfile(profileId);
  };

  useEffect(() => {
    if (!gameState) {
      startMatch(maxPlayers === 2 ? '2P' : '4P', user?.username || 'Govind');
    }
  }, [gameState, startMatch, user, maxPlayers]);

  // NOTE: Coin/XP rewards are handled by App.tsx when MATCH_RESULT view loads.
  // Do NOT add reward logic here — it would cause double payouts.



  // Turn Timer Countdown Loop
  useEffect(() => {
    if (!gameState || gameState.gameStatus === 'GAME_OVER') return;

    const interval = setInterval(() => {
      tickTurnTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, tickTurnTimer]);

  // Listen to incoming chat messages from the socket
  useEffect(() => {
    const handleIncomingChat = (e: Event) => {
      const customEvent = e as CustomEvent;
      const data = customEvent.detail;
      const newMsgItem: ChatMessageItem = {
        id: Date.now().toString() + Math.random().toString().slice(2, 5),
        sender: data.senderName || 'Opponent',
        text: data.text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        color: data.color || 'BLUE',
        isSpectator: data.isSpectator || false,
        isSystem: data.isSystem || false,
      };
      setChatHistory((prev) => [...prev.slice(-30), newMsgItem]);
      // Only show speech bubble for non-spectator, non-system messages
      if (!data.isSpectator && !data.isSystem && data.color) {
        setActiveSpeechBubbles((prev) => ({ ...prev, [data.color]: data.text }));
        setTimeout(() => {
          setActiveSpeechBubbles((prev) => ({ ...prev, [data.color]: null }));
        }, 2800);
      }
    };

    window.addEventListener('game_chat_message', handleIncomingChat);
    return () => window.removeEventListener('game_chat_message', handleIncomingChat);
  }, []);

  if (!gameState) return null;

  const activePlayer = gameState.players[gameState.activePlayerIndex];

  const handleSendMessage = (msg: string) => {
    const senderName = user?.displayName || user?.username || 'You';
    const gameSocket = useGameStore.getState().gameSocket;
    const gameStore = useGameStore.getState();
    const specMode = gameStore.isSpectatorMode;
    const activeCol = specMode ? 'BLUE' : (localPlayer?.color || 'BLUE');

    // Add to local chat history immediately
    const newMsgItem: ChatMessageItem = {
      id: Date.now().toString() + Math.random().toString().slice(2, 5),
      sender: senderName,
      text: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: activeCol,
      isSpectator: specMode,
    };
    setChatHistory((prev) => [...prev.slice(-30), newMsgItem]);

    if (!specMode) {
      // Player: show speech bubble on board
      setActiveSpeechBubbles((prev) => ({ ...prev, [activeCol]: msg }));
      setTimeout(() => {
        setActiveSpeechBubbles((prev) => ({ ...prev, [activeCol]: null }));
      }, 2800);
    }

    if (gameSocket) {
      // Use unified chat_message event for both players and spectators
      const playerRoomCode = useRoomStore.getState().roomCode;
      const spectatorRoomCode = (gameSocket as any).spectatorRoomCode || '';
      const resolvedRoomCode = specMode ? spectatorRoomCode : playerRoomCode;

      gameSocket.emit("chat_message", {
        roomCode: resolvedRoomCode,
        senderName: senderName,
        text: msg,
        color: activeCol,
        isSpectator: specMode,
      });
    }
  };

  // Share spectate link button handler
  const [shareCopied, setShareCopied] = useState(false);
  const handleShareSpectateLink = () => {
    const roomCode = useRoomStore.getState().roomCode;
    if (!roomCode) return;
    const spectateUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?spectate=${roomCode}`;
    navigator.clipboard?.writeText(spectateUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }).catch(() => {
      // Fallback: prompt
      window.prompt('Copy this link to share:', spectateUrl);
    });
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

                const isSingleTokenMode = player.tokens.length === 1;

                // Yard spot offsets for each House (Correct color alignment with background board yards)
                const houseOffsets: Record<string, Array<{ top: string; left: string }>> = {
                  RED: [
                    isSingleTokenMode ? { top: '30.3%', left: '24.3%' } : { top: '27.26%', left: '20.04%' },
                    { top: '27.26%', left: '28.56%' },
                    { top: '33.32%', left: '20.04%' },
                    { top: '33.32%', left: '28.56%' },
                  ],
                  GREEN: [
                    isSingleTokenMode ? { top: '30.3%', left: '75.1%' } : { top: '27.26%', left: '70.86%' },
                    { top: '27.26%', left: '79.38%' },
                    { top: '33.32%', left: '70.86%' },
                    { top: '33.32%', left: '79.97%' },
                  ],
                  YELLOW: [
                    isSingleTokenMode ? { top: '64.5%', left: '75.1%' } : { top: '61.30%', left: '70.86%' },
                    { top: '61.69%', left: '79.38%' },
                    { top: '67.56%', left: '70.86%' },
                    { top: '66.98%', left: '79.97%' },
                  ],
                  BLUE: [
                    isSingleTokenMode ? { top: '64.5%', left: '24.3%' } : { top: '61.30%', left: '20.04%' },
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
                          onMouseDown={(e) => {
                            if (isSpectatorMode) return;
                            handleMouseDown(e, token.id);
                          }}
                          onClick={() => {
                            if (isSpectatorMode) return;
                            if (isMoveable) {
                              moveToken(token.id);
                            }
                          }}
                          className={`absolute -translate-x-1/2 ${translateClass} w-[34px] h-[44px] p-0.5 z-30 flex items-center justify-center filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] transition-all duration-200 pointer-events-auto ${
                            isMoveable && !isSpectatorMode
                              ? 'cursor-pointer hover:scale-125 active:scale-95 ring-4 ring-yellow-400 ring-offset-1 rounded-full animate-bounce shadow-[0_0_15px_rgba(251,191,36,0.9)] z-40'
                              : isSpectatorMode ? 'pointer-events-none' : 'cursor-grab active:cursor-grabbing'
                          }`}
                          style={{
                            top: positionStyle.top,
                            left: positionStyle.left,
                          }}
                          <img src={tokenImg} alt={`${token.color} Token ${idx + 1}`} className="w-full h-full object-contain filter saturate-[2.8] contrast-[1.3] brightness-[1.2] drop-shadow-[0_0_12px_rgba(255,255,255,0.8)] pointer-events-auto cursor-pointer" />
                          
                          {showNumber && (
                            <div 
                              className="absolute -top-[13px] h-[18px] px-1 min-w-[22px] rounded-full flex items-center justify-center border-[1.5px] border-amber-300 shadow-[0_2px_6px_rgba(0,0,0,0.6)] font-black text-[9.5px] text-white z-50 select-none pointer-events-none gap-[1px]"
                              style={{
                                backgroundColor: badgeColors[token.color] || '#2563eb'
                              }}
                            >
                              <span>💣</span>
                              <span>{displayNum}</span>
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

          {gameState.players.length === 2 && (
            <>
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
                    diceId={opponentPlayer?.equippedDiceId}
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
                      !isSpectatorMode &&
                      !!(localPlayer &&
                      gameState.currentTurnColor === localPlayer.color &&
                      gameState.gameStatus === 'ROLL_WAIT' &&
                      !gameState.isDiceRolled)
                    }
                    onRoll={rollDice}
                    size={54}
                    playerColor={localPlayer?.color}
                    badgePosition="right"
                    diceId={localPlayer?.equippedDiceId}
                  />
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* 3. FIXED OVERLAY UI LAYER (Fixed absolute coordinate slots) */}
      <div className="w-full max-w-[430px] h-screen relative z-20 overflow-hidden pointer-events-none">

        {/* VIP SPECTATING BANNER */}
        {isSpectatorMode && (
          <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-gradient-to-r from-purple-900/95 via-amber-500/95 to-purple-900/95 border border-amber-400 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.6)] scale-95 transition-all">
            <span className="animate-pulse w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-1 font-sans">
              👁 LIVE SPECTATING
            </span>
          </div>
        )}

        {/* SHARE SPECTATE LINK BUTTON — only for active players, not spectators */}
        {!isSpectatorMode && (
          <div className="absolute top-5 right-3 z-30 pointer-events-auto">
            <button
              onClick={handleShareSpectateLink}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 border shadow-lg ${
                shareCopied
                  ? 'bg-green-500/90 border-green-400 text-white shadow-[0_0_10px_rgba(74,222,128,0.5)]'
                  : 'bg-purple-950/80 border-amber-400/40 text-amber-300 hover:border-amber-400/80'
              }`}
              title="Share spectate link"
            >
              {shareCopied ? '✅ Copied!' : '🔗 Share'}
            </button>
          </div>
        )}
        <div className="absolute top-5 left-3 z-30 pointer-events-auto">
          <button
            onClick={() => setShowMenu(true)}
            className="w-8 h-8 rounded-lg bg-purple-950/80 border border-amber-400/30 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
            title="Open Menu"
          >
            <span className="text-md text-amber-300 font-bold">☰</span>
          </button>
        </div>

        {/* OPPONENT PROFILE: TOP-RIGHT */}
        <div className="absolute top-12 right-3 z-20 pointer-events-auto">
          <div className="min-w-[98px]">
            {gameState && opponentPlayer && (
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
                onAvatarClick={() => handleProfileClick(opponentPlayer.color)}
                position="top-right"
                isLocalPlayer={false}
                remoteMicStatus={false}
              />
            )}
          </div>
        </div>

        {/* LOCAL PLAYER PROFILE: BOTTOM-LEFT */}
        <div className="absolute bottom-[45px] left-3 z-20 pointer-events-auto">
          <div className="min-w-[98px]">
            {gameState && localPlayer && (
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
                onAvatarClick={() => handleProfileClick(localPlayer.color)}
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
                onClick={handleMuteToggle}
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

          // 1. Emit forfeit/disconnect event to server so opponent gets WINNER declaration
          const roomCode = useRoomStore.getState().roomCode;
          const gameSocket = useGameStore.getState().gameSocket;
          if (gameSocket && roomCode) {
            gameSocket.emit("client_action", {
              roomCode,
              actionType: "FORFEIT",
              quittingColor: localPlayer?.color,
            });
          }

          // 2. Deduct entry fee penalty for quitting match
          const entryFee = parseInt(localStorage.getItem("ludo_current_entry_fee") || "5000");
          const currentCoins = user?.coins || 0;
          updateUser({ coins: Math.max(0, currentCoins - entryFee) });

          // 3. Declare local player as LOSER by forfeit
          const oppColor = opponentPlayer?.color || 'GREEN';
          const gameOverState = {
            ...gameState!,
            gameStatus: 'GAME_OVER' as const,
            winnerRankings: [oppColor],
            lastActionSummary: `Match Forfeited! ${localPlayer?.name} quit the match.`,
          };
          useGameStore.setState({ gameState: gameOverState });
          localStorage.setItem("ludo_classic_engine_state", JSON.stringify(gameOverState));

          SoundEngine.play('WIN' as any);
        }}
      />

      {/* Chat Modal — enhanced with spectator support */}
      <ChatModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        onSendMessage={handleSendMessage}
        messages={chatHistory}
        isSpectatorMode={isSpectatorMode}
      />

      {/* 🏆 Match Result Victory / Defeat Modal Overlay (Snake & Ladders Style) */}
      {gameState?.gameStatus === 'GAME_OVER' && (() => {
        const winnerColor = gameState.winnerRankings?.[0];
        const isWinner = winnerColor === localPlayer?.color;
        const entryFee = parseInt(localStorage.getItem("ludo_current_entry_fee") || "5000");
        const winReward = Math.round(entryFee * 1.9);

        const localTokensHome = localPlayer?.tokens?.filter((t: any) => t.state === 'HOME').length || 0;
        const localKills = localPlayer?.tokens?.reduce((acc: number, t: any) => acc + (t.stepCount > 0 ? 1 : 0), 0) || 0;

        const killsXP = localKills * 10;
        const passXP = localTokensHome * 50;
        const winXP = isWinner ? 200 : 20;
        const totalXP = killsXP + passXP + winXP;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-400/40 p-6 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center flex flex-col items-center gap-4">
              
              {/* Header Badge */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(245,158,11,0.6)] border border-yellow-200">
                {isWinner ? "🏆" : "💔"}
              </div>

              <div>
                <h2 className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 uppercase">
                  {isWinner ? "VICTORY!" : "MATCH ENDED"}
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {isWinner
                    ? (gameState.lastActionSummary?.includes("quit") || gameState.lastActionSummary?.includes("disconnected")
                        ? `${opponentPlayer?.name || "Opponent"} quit the match! You win!`
                        : "Congratulations! You completed all tokens first!")
                    : (gameState.lastActionSummary?.includes("quit")
                        ? `You quit the match. Match Forfeited!`
                        : `${opponentPlayer?.name || "Opponent"} won the match!`)
                  }
                </p>
              </div>

              {/* Rewards Summary Box */}
              <div className="w-full rounded-2xl bg-slate-800/80 border border-slate-700/60 p-4 flex flex-col gap-3">
                {/* Coins Row */}
                <div className={`flex items-center justify-between px-3 py-2 rounded-xl border ${
                  isWinner ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🪙</span>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isWinner ? 'text-amber-200' : 'text-rose-200'}`}>
                      {isWinner ? "Bet Win Reward" : "Forfeit / Defeat Penalty"}
                    </span>
                  </div>
                  <span className={`text-sm font-black ${isWinner ? 'text-amber-400' : 'text-rose-400'}`}>
                    {isWinner ? `+${winReward.toLocaleString()} Coins` : `-${entryFee.toLocaleString()} Coins`}
                  </span>
                </div>

                {/* XP Breakdown Header */}
                <div className="text-[10px] font-black uppercase text-purple-300 tracking-wider text-left pl-1">
                  XP Rewards Breakdown
                </div>

                {/* Tokens Home XP Row */}
                <div className="flex items-center justify-between text-xs text-slate-300 px-2">
                  <span className="flex items-center gap-1.5">
                    🏁 <span>{localTokensHome} Tokens Home</span> <span className="text-[10px] text-slate-500">(×50 XP)</span>
                  </span>
                  <span className="font-extrabold text-emerald-400">+{passXP} XP</span>
                </div>

                {/* Win Bonus XP Row */}
                <div className="flex items-center justify-between text-xs text-slate-300 px-2">
                  <span className="flex items-center gap-1.5">
                    🏆 <span>{isWinner ? "Victory Bonus" : "Match Bonus"}</span>
                  </span>
                  <span className="font-extrabold text-emerald-400">+{winXP} XP</span>
                </div>

                <div className="h-[1px] bg-slate-700/60 my-0.5" />

                {/* Total XP Row */}
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-black uppercase text-purple-200 tracking-wider">Total XP Earned</span>
                  <span className="text-sm font-black text-purple-400">+{totalXP} XP</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex w-full gap-2">
                <button
                  onClick={() => {
                    useGameStore.getState().resetMatch();
                    localStorage.removeItem("ludo_classic_engine_state");
                    onLeaveGame();
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:scale-102 active:scale-95 transition-all border-0 outline-none cursor-pointer"
                >
                  🚪 Exit Match
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Luxury 1v1 Live Camera overlay */}
      <LuxuryLiveCamera
        localPlayer={localPlayer}
        opponentPlayer={opponentPlayer}
        isOneVsOne={true}
      />
    </div>
  );
};
