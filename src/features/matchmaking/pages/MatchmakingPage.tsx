import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useQueueStore } from "../queue/QueueStore";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import { useUserStore } from "../../../user/user.store";

interface MatchmakingPageProps {
  onCancel: () => void;
  onMatchFound: (
    opponent?: { name: string; avatar?: string; profileFrame?: string; nameBanner?: string; color?: string; isBot?: boolean },
    myColor?: string,
    isHost?: boolean
  ) => void;
}



export const MatchmakingPage: React.FC<MatchmakingPageProps> = ({ onCancel, onMatchFound }) => {
  const { mode, setMatchFound } = useQueueStore();
  const [seconds, setSeconds] = useState(120);
  const user = useUserStore((s) => s.user);

  const displayName = user?.displayName || user?.username || "Player 1";
  const avatar = user?.avatar;

  const formatMMSS = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const mm = mins < 10 ? `0${mins}` : `${mins}`;
    const ss = secs < 10 ? `0${secs}` : `${secs}`;
    return `${mm}:${ss}`;
  };

  const [opponent, setOpponent] = useState<{ id?: string; name: string; avatar?: string; profileFrame?: string; nameBanner?: string; color?: string; roomCode?: string; isBot?: boolean } | null>(null);
  const [myAssignedColor, setMyAssignedColor] = useState<string | null>(null);
  const [matchConnected, setMatchConnected] = useState(false);
  const [matchCountdown, setMatchCountdown] = useState(5);
  const [coinsDeducted, setCoinsDeducted] = useState(false);
  const [showDeductText, setShowDeductText] = useState(false);
  const [isHost, setIsHost] = useState(true);

  useEffect(() => {
    // Connect to live multiplayer server
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const socketUrl = import.meta.env.DEV ? `http://${host}:8000` : window.location.origin;
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    socket.emit("join_queue", {
      userId: user?.id || "usr_" + Math.floor(Math.random() * 100000),
      name: displayName,
      avatar: avatar,
      profileFrame: "/assets/images/icons/profile_frame_v3.png",
      nameBanner: "/assets/images/icons/name_banner_v2.png",
    });

    socket.on("match_found", (data: any) => {
      console.log("Real match connected!", data);
      if (data.opponent) {
        setOpponent({ 
          name: data.opponent.name, 
          avatar: data.opponent.avatar,
          profileFrame: data.opponent.profileFrame || "/assets/images/icons/profile_frame_v3.png",
          nameBanner: data.opponent.nameBanner || "/assets/images/icons/name_banner_v2.png",
          color: data.opponent.color,
          roomCode: data.roomCode,
          isBot: false, // Real matched player — disable auto-play
        });
      }
      setMyAssignedColor(data.color);
      setIsHost(data.isHost !== undefined ? data.isHost : true);
      setMatchConnected(true);
    });

    return () => {
      socket.emit("leave_queue");
      socket.disconnect();
    };
  }, [user?.id, displayName, avatar]);

  // Main searching timer (stops immediately once connected)
  useEffect(() => {
    if (matchConnected) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setMatchConnected(true); // Trigger 5s deduction phase on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchConnected]);

  // Handle 5-Second Coin Deduction Loading phase once connected
  useEffect(() => {
    if (!matchConnected) return;

    setShowDeductText(true);

    const countdownTimer = setInterval(() => {
      setMatchCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          setMatchFound(true);

          let finalMyColor = myAssignedColor;
          let finalOpponent = opponent;

          if (!finalOpponent) {
            // Local bot fallback match -> Randomly select Pair A (BLUE vs GREEN) or Pair B (RED vs YELLOW)
            const selectedPair = Math.random() < 0.5 ? "PAIR_A" : "PAIR_B";
            const swapColors = Math.random() < 0.5;
            const myColor = selectedPair === "PAIR_A"
              ? (swapColors ? "BLUE" : "GREEN")
              : (swapColors ? "RED" : "YELLOW");
            const oppColor = selectedPair === "PAIR_A"
              ? (swapColors ? "GREEN" : "BLUE")
              : (swapColors ? "YELLOW" : "RED");

            finalMyColor = myColor;
            finalOpponent = {
              name: "Rahul Sharma",
              avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
              profileFrame: "/assets/images/icons/profile_frame_v3.png",
              nameBanner: "/assets/images/icons/name_banner_v2.png",
              color: oppColor,
              isBot: true, // Bot fallback — auto-play enabled
            };
          }

          onMatchFound(finalOpponent, finalMyColor || "GREEN", isHost);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownTimer);
  }, [matchConnected, onMatchFound, setMatchFound, opponent, myAssignedColor]);

  return (
    <div className="min-h-screen w-full bg-[#12061F] text-white flex flex-col justify-between items-center px-4 py-8 relative overflow-hidden select-none font-sans">
      {/* 1. Ludo Themed Background */}
      <LudoPageBackground variant="room" />

      <div className="w-full max-w-[400px] flex-1 flex flex-col items-center justify-between z-10 my-4">
        {/* Top Header Badge */}
        <div className="w-full flex justify-center mt-2">
          {mode === "Snake & Ladders" ? (
            <div className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 border-2 border-yellow-200 shadow-[0_0_25px_rgba(245,158,11,0.7)] text-slate-950 font-black text-sm uppercase tracking-widest flex items-center gap-2">
              <span>🐍</span>
              <span>SNAKE & LADDERS 1V1</span>
            </div>
          ) : (
            <img
              src="/assets/images/icons/luxury_2p_classic_header.png"
              alt="2 PLAYER CLASSIC"
              className="w-72 h-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
              draggable={false}
            />
          )}
        </div>

        {/* Graphic & VS Emblem */}
        <div className="flex flex-col items-center text-center my-auto relative">
          {/* Animated Circle & VS Emblem */}
          <div className="relative w-64 h-64 flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-amber-400/60 animate-[spin_8s_linear_infinite] shadow-2xl z-50 pointer-events-none"></div>
            <div className="absolute inset-4 rounded-full border-2 border-dashed border-purple-400/40 animate-[spin_12s_linear_infinite_reverse] z-50 pointer-events-none"></div>

            {/* Custom keyframes style block for smooth, premium floating animations */}
            <style>{`
              @keyframes floatUp {
                0% { transform: translateY(0) scale(0.7); opacity: 0; }
                15% { transform: translateY(-8px) scale(1.15); opacity: 1; }
                80% { transform: translateY(-40px) scale(1.05); opacity: 1; }
                100% { transform: translateY(-55px) scale(0.9); opacity: 0; }
              }
            `}</style>

            {/* Top-Left Profile (Player 1 / Host) shifted 5% lower */}
            <div className="absolute -top-6 -left-6 z-40 flex flex-col items-center pointer-events-none" style={{ width: '100px' }}>
              <div className="relative w-[100px] h-[100px]">
                <div
                  className="absolute rounded-full overflow-hidden z-10"
                  style={{ top: '16%', left: '20%', right: '20%', bottom: '28%' }}
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Player"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-3xl bg-slate-900">👤</span>
                  )}
                </div>
                <img
                  src="/assets/images/icons/profile_frame_v3.png"
                  alt="Profile Frame"
                  className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none"
                  draggable={false}
                />
              </div>

              <div className="relative w-[115px] -mt-[10px] flex flex-col items-center justify-center">
                <img
                  src="/assets/images/icons/name_banner_v2.png"
                  alt="Name Banner"
                  className="w-full h-auto object-contain pointer-events-none"
                  draggable={false}
                />
                <span 
                  className={`absolute inset-0 flex items-center justify-center font-black text-amber-200 tracking-wider drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] pointer-events-none px-2 text-center overflow-hidden truncate max-w-[90%] ${
                    displayName.length <= 8 ? 'text-[9px]' : displayName.length <= 12 ? 'text-[8px]' : 'text-[7px]'
                  }`}
                >
                  {displayName}
                </span>
              </div>

              {/* OPAQUE FLOATING COIN DEDUCTION TEXT */}
              {showDeductText && (
                <div className="absolute -right-2 top-0 z-50 text-red-500 font-extrabold text-[13px] tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)] animate-[floatUp_2s_ease-out_forwards] flex items-center gap-1 select-none whitespace-nowrap">
                  -5000 <img src="/assets/images/icons/luxury_coin.png" className="w-3.5 h-3.5 object-contain" alt="coin" />
                </div>
              )}
            </div>

            {/* Bottom-Right Profile (Player 2 / Joiner Opponent) - Only shown when connected */}
            {opponent && (
              <div className="absolute -bottom-6 -right-6 z-40 flex flex-col items-center pointer-events-none" style={{ width: '100px' }}>
                <div className="relative w-[100px] h-[100px]">
                  <div
                    className="absolute rounded-full overflow-hidden z-10 bg-slate-900 flex items-center justify-center"
                    style={{ top: '16%', left: '20%', right: '20%', bottom: '28%' }}
                  >
                    <img
                      src={opponent.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                      alt="Opponent Joiner"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <img
                    src={opponent.profileFrame || "/assets/images/icons/profile_frame_v3.png"}
                    alt="Profile Frame"
                    className="absolute inset-0 w-full h-full object-contain z-20 pointer-events-none"
                    draggable={false}
                  />
                </div>

                <div className="relative w-[115px] -mt-[10px] flex flex-col items-center justify-center">
                  <img
                    src={opponent.nameBanner || "/assets/images/icons/name_banner_v2.png"}
                    alt="Name Banner"
                    className="w-full h-auto object-contain pointer-events-none"
                    draggable={false}
                  />
                  <span 
                    className="absolute inset-0 flex items-center justify-center font-black text-amber-200 tracking-wider drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] pointer-events-none px-2 text-center overflow-hidden truncate max-w-[90%] text-[8.5px]"
                  >
                    {opponent.name}
                  </span>
                </div>

                {/* OPAQUE FLOATING COIN DEDUCTION TEXT */}
                {showDeductText && (
                  <div className="absolute -left-[54px] top-0 z-50 text-red-500 font-extrabold text-[13px] tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)] animate-[floatUp_2s_ease-out_forwards] flex items-center gap-1 select-none whitespace-nowrap">
                    -5000 <img src="/assets/images/icons/luxury_coin.png" className="w-3.5 h-3.5 object-contain" alt="coin" />
                  </div>
                )}
              </div>
            )}

            {/* VS Emblem & Golden Coins Rain Animation */}
            <div className="absolute w-[160px] h-[160px] z-20 flex flex-col items-center justify-center select-none pointer-events-none">
              <img
                src="/assets/images/icons/vs_gold_emblem.png"
                alt="VS"
                className="w-full h-full object-contain animate-pulse drop-shadow-[0_0_20px_rgba(251,191,36,0.9)]"
                draggable={false}
              />

              {!matchConnected ? (
                /* Searching Timer Badge */
                <div className="absolute -top-[88px] bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 px-4 py-1 rounded-full border-2 border-yellow-200 shadow-[0_4px_15px_rgba(0,0,0,0.95)] flex items-center justify-center z-30">
                  <span className="text-slate-950 font-mono font-black text-sm tracking-widest">
                    {formatMMSS(seconds)}
                  </span>
                </div>
              ) : (
                /* 🪙 Coin Deduction / 5s Loading Status Badge */
                <div className="absolute -top-[88px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-4 py-1 rounded-full border-2 border-amber-200 shadow-[0_4px_20px_rgba(251,191,36,0.9)] flex items-center justify-center z-40 animate-pulse whitespace-nowrap min-w-[210px]">
                  <span className="text-slate-950 font-mono font-black text-[9.5px] tracking-wider flex items-center justify-center gap-1.5">
                    <span className="animate-spin inline-block w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full"></span>
                    COINS DEDUCTED: {matchCountdown}S
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Cancel Button */}
        {!matchConnected && (
          <button
            onClick={onCancel}
            className="w-full flex justify-center hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-none mb-4"
          >
            <img
              src="/assets/images/icons/luxury_cancel_button.png"
              alt="CANCEL"
              className="w-64 h-auto object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.9)]"
              draggable={false}
            />
          </button>
        )}
      </div>
    </div>
  );
};
