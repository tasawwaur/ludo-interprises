import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useQueueStore } from "../queue/QueueStore";
import { LudoPageBackground } from "../../../components/effects/LudoPageBackground";
import { useUserStore } from "../../../user/user.store";
import { getSocketUrl } from "../../../utils/socketUrl";
import { GLOBAL_PLAYER_DATABASE } from "../../../store/player-database.store";

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
  const [seconds, setSeconds] = useState(6); // ✅ 6s search → auto bot if no real player found
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
  const [socketConnected, setSocketConnected] = useState(false);
  const [serverStatus, setServerStatus] = useState<"waking" | "online">("waking");
  const [matchCountdown, setMatchCountdown] = useState(1); // ✅ 1s countdown for instant feel
  const [coinsDeducted, setCoinsDeducted] = useState(false);
  const [showDeductText, setShowDeductText] = useState(false);
  const [isHost, setIsHost] = useState(true);

  useEffect(() => {
    const socketUrl = getSocketUrl();
    const activeQueueMode = useQueueStore.getState().mode || "2P Classic";
    const currentEntryFee = parseInt(localStorage.getItem("ludo_current_entry_fee") || "5000");

    let socketRef: ReturnType<typeof io> | null = null;
    let cancelled = false;

    const wakeAndConnect = async () => {
      // ✅ Step 1: Wake up Render server — HTTP ping (handles free-tier sleep)
      setServerStatus("waking");
      try {
        const apiUrl = socketUrl.replace(/\/$/, "") + "/api/status";
        await fetch(apiUrl, { method: "GET" });
      } catch (_) { /* ignore — socket will retry */ }

      if (cancelled) return;
      setServerStatus("online");

      // ✅ Step 2: Connect socket (server is now awake)
      const socket = io(socketUrl, {
        transports: ["polling", "websocket"], // polling first — more reliable on Render free tier
        reconnection: true,
        reconnectionAttempts: 15,
        reconnectionDelay: 2000,
        timeout: 30000,
      });
      socketRef = socket;

      socket.on("connect", () => {
        if (cancelled) return;
        setSocketConnected(true);

        // ✅ Step 3: join_queue ONLY after socket is confirmed connected
        socket.emit("join_queue", {
          userId: user?.id || "usr_" + Math.floor(Math.random() * 100000),
          name: displayName,
          avatar: avatar,
          profileFrame: "/assets/images/icons/profile_frame_v3.png",
          nameBanner: "/assets/images/icons/name_banner_v2.png",
          mode: activeQueueMode,
          entryFee: currentEntryFee,
        });
      });

      socket.on("disconnect", () => {
        if (!cancelled) setSocketConnected(false);
      });

      socket.on("match_found", (data: any) => {
        if (cancelled) return;
        console.log("Real match connected!", data);
        if (data.opponent) {
          setOpponent({
            name: data.opponent.name,
            avatar: data.opponent.avatar,
            profileFrame: data.opponent.profileFrame || "/assets/images/icons/profile_frame_v3.png",
            nameBanner: data.opponent.nameBanner || "/assets/images/icons/name_banner_v2.png",
            color: data.opponent.color,
            roomCode: data.roomCode,
            isBot: false,
          });
        }
        setMyAssignedColor(data.color);
        setIsHost(data.isHost !== undefined ? data.isHost : true);
        setMatchCountdown(1); // ✅ Real match found → start in 1 second
        setMatchConnected(true);
      });
    };

    wakeAndConnect();

    return () => {
      cancelled = true;
      if (socketRef) {
        socketRef.emit("leave_queue");
        socketRef.disconnect();
      }
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

          // ✅ Defer state updates to next tick to avoid React "setState during render" warning
          setTimeout(() => {
            setMatchFound(true);

            let finalMyColor = myAssignedColor;
            let finalOpponent = opponent;

            if (!finalOpponent) {
              const activeQueueMode = useQueueStore.getState().mode || "Normal Classic";

              const isNormal = activeQueueMode === "Normal Classic";
              const myColor   = isNormal ? "RED"    : (Math.random() < 0.5 ? "BLUE"   : "GREEN");
              const oppColor  = isNormal ? "YELLOW" : (myColor === "BLUE"   ? "GREEN"  : "BLUE");

              const randomBot = GLOBAL_PLAYER_DATABASE[Math.floor(Math.random() * GLOBAL_PLAYER_DATABASE.length)];

              finalMyColor = myColor;
              finalOpponent = {
                name: randomBot.username,
                avatar: randomBot.avatarUrl,
                profileFrame: "/assets/images/icons/profile_frame_v3.png",
                nameBanner: "/assets/images/icons/name_banner_v2.png",
                color: oppColor,
                isBot: true,
              };
            }

            onMatchFound(finalOpponent || undefined, finalMyColor || "GREEN", isHost);
          }, 0);

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

        {/* Live Socket Server Connection Status Badge */}
        <div className="w-full flex justify-center mt-3">
          <div className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg ${
            socketConnected
              ? "bg-emerald-950/90 border-emerald-400 text-emerald-300"
              : serverStatus === "waking"
              ? "bg-purple-950/90 border-purple-400 text-purple-300 animate-pulse"
              : "bg-amber-950/90 border-amber-400 text-amber-300 animate-pulse"
          }`}>
            <span className={`w-2 h-2 rounded-full ${socketConnected ? "bg-emerald-400 animate-ping" : serverStatus === "waking" ? "bg-purple-400" : "bg-amber-400"}`} />
            <span>{socketConnected ? "🟢 MULTIPLAYER SERVER: ONLINE" : serverStatus === "waking" ? "⏳ SERVER STARTING UP..." : "🔄 CONNECTING TO SERVER..."}</span>
          </div>
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
              {showDeductText && (() => {
                const fee = parseInt(localStorage.getItem("ludo_current_entry_fee") || "5000");
                return (
                  <div className="absolute -right-2 top-0 z-50 text-red-500 font-extrabold text-[13px] tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)] animate-[floatUp_2s_ease-out_forwards] flex items-center gap-1 select-none whitespace-nowrap">
                    -{fee.toLocaleString()} <img src="/assets/images/icons/luxury_coin.png" className="w-3.5 h-3.5 object-contain" alt="coin" />
                  </div>
                );
              })()}
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
                {showDeductText && (() => {
                  const fee = parseInt(localStorage.getItem("ludo_current_entry_fee") || "5000");
                  return (
                    <div className="absolute -left-[54px] top-0 z-50 text-red-500 font-extrabold text-[13px] tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,1)] animate-[floatUp_2s_ease-out_forwards] flex items-center gap-1 select-none whitespace-nowrap">
                      -{fee.toLocaleString()} <img src="/assets/images/icons/luxury_coin.png" className="w-3.5 h-3.5 object-contain" alt="coin" />
                    </div>
                  );
                })()}
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
