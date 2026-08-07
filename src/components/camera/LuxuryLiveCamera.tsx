import React, { useState, useEffect, useRef } from "react";
import { VoiceChatService } from "../../game/sound/VoiceChatService";

interface CameraPodProps {
  playerName: string;
  playerAvatar: string;
  defaultX: number;
  defaultY: number;
  isLocal: boolean;
  localVideoRef?: React.RefObject<HTMLVideoElement | null>;
  camOn: boolean;
  paused: boolean;
  micOn: boolean;
  onToggleCam?: () => void;
  onTogglePause?: () => void;
  onToggleMic?: () => void;
}

const CameraPod: React.FC<CameraPodProps> = ({
  playerName, playerAvatar, defaultX, defaultY, isLocal, localVideoRef,
  camOn, paused, micOn, onToggleCam, onTogglePause, onToggleMic,
}) => {
  const size = 140;

  return (
    <div
      style={{
        position: "absolute",
        top: 0, left: 0,
        transform: `translate3d(${defaultX}px, ${defaultY}px, 0)`,
        zIndex: 45,
        userSelect: "none",
      }}
    >
      {/* Camera pod box */}
      <div
        style={{ width: size, height: size }}
        className={`relative rounded-2xl bg-black overflow-hidden border-2 shadow-lg transition-all duration-200 ${
          camOn && !paused
            ? "border-amber-400 shadow-[0_0_14px_rgba(245,158,11,0.6)]"
            : "border-purple-600/60 shadow-[0_0_8px_rgba(139,92,246,0.3)]"
        }`}
      >
        {/* Live dot */}
        <div className="absolute top-2.5 right-2.5 z-30">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping absolute"></span>
          <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full block"></span>
        </div>

        {/* Video (only if local player on this screen) */}
        {isLocal && camOn && !paused && localVideoRef && (
          <video
            ref={localVideoRef}
            autoPlay playsInline muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        )}

        {/* Avatar placeholder when camera OFF or opponent */}
        {(!camOn || paused || !isLocal) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-purple-950/90">
            <img
              src={playerAvatar || "/assets/images/icons/icon_club_crown.png"}
              alt={playerName}
              className="rounded-full border-2 border-amber-400/50 object-cover"
              style={{ width: size * 0.45, height: size * 0.45 }}
            />
            <div className="absolute bottom-10 bg-black/70 px-2 py-0.5 rounded-md text-[9px] text-gray-300 font-bold uppercase animate-pulse">
              📹 {camOn ? "LIVE" : "OFF"}
            </div>
          </div>
        )}

        {/* Paused overlay */}
        {isLocal && camOn && paused && (
          <div className="absolute inset-0 bg-black/85 flex items-center justify-center z-20">
            <span className="text-xs font-black uppercase text-rose-500 tracking-widest animate-pulse">PAUSED</span>
          </div>
        )}

        {/* HD indicator */}
        {isLocal && camOn && !paused && (
          <div className="absolute top-2 left-2 z-20">
            <span className="text-[9px] text-emerald-400 font-bold">● HD</span>
          </div>
        )}

        {/* ── INSIDE CAMERA CONTROLS BAR (Pause, Cam, Mic Buttons) ── */}
        {isLocal && (
          <div className="absolute bottom-2 left-2 right-2 z-30 flex items-center justify-between pointer-events-auto">
            {/* Pause Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePause?.();
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all shadow-md active:scale-90 ${
                paused
                  ? "bg-rose-600/90 border-rose-400 text-white"
                  : "bg-slate-900/80 border-amber-400/70 text-amber-300 hover:bg-slate-800"
              }`}
              title={paused ? "Resume Camera" : "Pause Camera"}
            >
              <span className="text-xs leading-none">{paused ? "▶️" : "⏸️"}</span>
            </button>

            {/* Camera ON/OFF main toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCam?.();
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all shadow-md active:scale-90 ${
                camOn
                  ? "bg-emerald-600/90 border-emerald-300 text-white"
                  : "bg-slate-900/80 border-amber-400/70 text-amber-300 hover:bg-slate-800"
              }`}
              title={camOn ? "Turn Camera Off" : "Turn Camera On"}
            >
              <span className="text-xs leading-none">📹</span>
            </button>

            {/* Mic Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleMic?.();
              }}
              className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all shadow-md active:scale-90 cursor-pointer ${
                micOn
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 border-amber-300 text-white animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                  : "bg-gradient-to-r from-red-600 to-rose-700 border-amber-400/80 text-white opacity-95"
              }`}
              title={micOn ? "Mic: ON" : "Mic: OFF"}
            >
              <span className="text-xs leading-none">{micOn ? "🎙️" : "🔇"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
interface LuxuryLiveCameraProps {
  localPlayer?: any;
  opponentPlayer?: any;
  isOneVsOne: boolean;
}

export const LuxuryLiveCamera: React.FC<LuxuryLiveCameraProps> = ({
  localPlayer,
  opponentPlayer,
  isOneVsOne,
}) => {
  if (!isOneVsOne) return null;

  const [localCamOn, setLocalCamOn] = useState(() => {
    try { return localStorage.getItem('ludo_cam_on') === '1'; } catch { return false; }
  });
  const [localPaused, setLocalPaused] = useState(() => {
    try { return localStorage.getItem('ludo_cam_paused') === '1'; } catch { return false; }
  });
  const [localMicOn, setLocalMicOn] = useState(() => {
    try {
      const saved = localStorage.getItem('ludo_mic_on');
      return saved !== null ? saved === '1' : VoiceChatService.isMicrophoneActive();
    } catch { return VoiceChatService.isMicrophoneActive(); }
  });

  const [opponentCamOn, setOpponentCamOn] = useState(false);

  // Editable coordinates with localStorage save/retrieve (Defaults set to tuned mobile/PC coordinates)
  const [localX, setLocalX] = useState(() => {
    try { return Number(localStorage.getItem('debug_cam_local_x') || '213'); } catch { return 213; }
  });
  const [localY, setLocalY] = useState(() => {
    try { return Number(localStorage.getItem('debug_cam_local_y') || '428'); } catch { return 428; }
  });
  const [oppX, setOppX] = useState(() => {
    try { return Number(localStorage.getItem('debug_cam_opp_x') || '8'); } catch { return 8; }
  });
  const [oppY, setOppY] = useState(() => {
    try { return Number(localStorage.getItem('debug_cam_opp_y') || '223'); } catch { return 223; }
  });

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef     = useRef<MediaStream | null>(null);

  // Persist camera settings on change
  useEffect(() => {
    try { localStorage.setItem('ludo_cam_on', localCamOn ? '1' : '0'); } catch {}
  }, [localCamOn]);

  useEffect(() => {
    try { localStorage.setItem('ludo_cam_paused', localPaused ? '1' : '0'); } catch {}
  }, [localPaused]);

  useEffect(() => {
    try { localStorage.setItem('ludo_mic_on', localMicOn ? '1' : '0'); } catch {}
  }, [localMicOn]);

  // Persist offset positions
  useEffect(() => {
    try {
      localStorage.setItem('debug_cam_local_x', String(localX));
      localStorage.setItem('debug_cam_local_y', String(localY));
      localStorage.setItem('debug_cam_opp_x', String(oppX));
      localStorage.setItem('debug_cam_opp_y', String(oppY));
    } catch {}
  }, [localX, localY, oppX, oppY]);

  // Auto-toggle opponent cam when local turns on
  useEffect(() => {
    if (localCamOn) {
      const t = setTimeout(() => setOpponentCamOn(true), 1500);
      return () => clearTimeout(t);
    } else {
      setOpponentCamOn(false);
    }
  }, [localCamOn]);

  // Webcam stream
  useEffect(() => {
    if (localCamOn && !localPaused) {
      (async () => {
        try {
          if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
          streamRef.current = stream;
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        } catch (e) { console.warn("Camera:", e); }
      })();
    } else {
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
    }
    return () => {
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    };
  }, [localCamOn, localPaused]);

  // Auto-restart mic
  useEffect(() => {
    if (localMicOn) {
      VoiceChatService.startMicrophone().catch(() => {});
    }
  }, []);

  const handleToggleMic = async () => {
    if (localMicOn) {
      VoiceChatService.stopMicrophone();
      setLocalMicOn(false);
    } else {
      const success = await VoiceChatService.startMicrophone();
      setLocalMicOn(success);
    }
  };

  const resetToDefault = () => {
    setLocalX(213);
    setLocalY(428);
    setOppX(8);
    setOppY(223);
  };

  return (
    <>
      {/* Camera Pod 1 — Local Player Pod */}
      <CameraPod
        playerName={localPlayer?.name || "You"}
        playerAvatar={localPlayer?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"}
        defaultX={localX}
        defaultY={localY}
        isLocal={true}
        localVideoRef={localVideoRef}
        camOn={localCamOn}
        paused={localPaused}
        micOn={localMicOn}
        onToggleCam={() => setLocalCamOn(p => !p)}
        onTogglePause={() => setLocalPaused(p => !p)}
        onToggleMic={handleToggleMic}
      />

      {/* Camera Pod 2 — Opponent Pod */}
      <CameraPod
        playerName={opponentPlayer?.name || "Opponent"}
        playerAvatar={opponentPlayer?.avatar || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80"}
        defaultX={oppX}
        defaultY={oppY}
        isLocal={false}
        camOn={opponentCamOn}
        paused={false}
        micOn={false}
      />    </>
  );
};

export default LuxuryLiveCamera;
