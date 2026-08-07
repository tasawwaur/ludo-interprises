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

  // Editable coordinates with localStorage save/retrieve (Defaults match PC)
  const [localX, setLocalX] = useState(() => {
    try { return Number(localStorage.getItem('debug_cam_local_x') || '201'); } catch { return 201; }
  });
  const [localY, setLocalY] = useState(() => {
    try { return Number(localStorage.getItem('debug_cam_local_y') || '358'); } catch { return 358; }
  });
  const [oppX, setOppX] = useState(() => {
    try { return Number(localStorage.getItem('debug_cam_opp_x') || '-2'); } catch { return -2; }
  });
  const [oppY, setOppY] = useState(() => {
    try { return Number(localStorage.getItem('debug_cam_opp_y') || '153'); } catch { return 153; }
  });

  const [showDebugger, setShowDebugger] = useState(true);

  // Draggable positioning state for the debug menu itself
  const [dbPos, setDbPos] = useState({ x: 0, y: -200 }); // Shift it up on load so it doesn't block bottom
  const [dragging, setDragging] = useState(false);
  const relRef = useRef({ x: 0, y: 0 });

  const startDrag = (clientX: number, clientY: number) => {
    setDragging(true);
    relRef.current = { x: clientX - dbPos.x, y: clientY - dbPos.y };
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    startDrag(e.clientX, e.clientY);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDbPos({
        x: e.clientX - relRef.current.x,
        y: e.clientY - relRef.current.y
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      setDbPos({
        x: touch.clientX - relRef.current.x,
        y: touch.clientY - relRef.current.y
      });
    };

    const stopDrag = () => setDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', stopDrag);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopDrag);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', stopDrag);
    };
  }, [dragging]);

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
    setLocalX(201);
    setLocalY(358);
    setOppX(-2);
    setOppY(153);
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
      />

      {/* 🛠️ DEVELOPER INTERACTIVE COORDINATES DEBUGGER OVERLAY */}
      <div 
        className="fixed bottom-[40px] left-1/2 z-[99999] pointer-events-auto select-none"
        style={{ 
          width: '94%', 
          maxWidth: '360px',
          transform: `translate3d(${dbPos.x}px, ${dbPos.y}px, 0) translateX(-50%)`,
          left: '50%',
          cursor: dragging ? 'grabbing' : 'grab'
        }}
      >
        {!showDebugger ? (
          <button
            onClick={() => setShowDebugger(true)}
            className="w-full py-2 rounded-xl bg-purple-950/95 border border-amber-400/40 text-[9px] font-black tracking-widest text-amber-300 shadow-md flex items-center justify-center gap-1.5 cursor-pointer uppercase"
          >
            ⚙️ Open Tuner Panel
          </button>
        ) : (
          <div className="rounded-2xl bg-slate-950/95 border border-amber-400 p-2 shadow-[0_4px_30px_rgba(0,0,0,0.85)] flex flex-col gap-2">
            {/* Header / Drag Bar */}
            <div 
              onMouseDown={onMouseDown}
              onTouchStart={onTouchStart}
              className="flex items-center justify-between border-b border-purple-500/20 pb-1 cursor-grab active:cursor-grabbing"
              title="Drag here to move this tuner window"
            >
              <div className="flex items-center gap-1 flex-1">
                <span className="text-[10px] text-amber-400">⚡</span>
                <span className="text-[8px] font-black tracking-widest text-amber-400">DRAG ME OUT OF THE WAY</span>
              </div>
              <div className="flex gap-1.5 items-center">
                <button 
                  onClick={resetToDefault}
                  className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-[7px] font-bold text-gray-300 hover:text-white cursor-pointer"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setShowDebugger(false)}
                  className="text-gray-400 hover:text-white text-xs font-black cursor-pointer px-1.5"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Adjusters grid */}
            <div className="grid grid-cols-2 gap-2 text-[9.5px]">
              {/* Local Player Box */}
              <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-900/50 flex flex-col gap-1.5">
                <div className="font-extrabold text-purple-300 border-b border-purple-900/40 pb-0.5">👤 YOUR POD (BOTTOM)</div>
                
                {/* Adjust X */}
                <div className="flex flex-col">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>X Coord</span>
                    <span className="text-amber-300 font-black">{localX}px</span>
                  </div>
                  <div className="flex gap-1 mt-1 justify-between">
                    <button onClick={() => setLocalX(p => p - 10)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">-10</button>
                    <button onClick={() => setLocalX(p => p - 1)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">-1</button>
                    <button onClick={() => setLocalX(p => p + 1)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">+1</button>
                    <button onClick={() => setLocalX(p => p + 10)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">+10</button>
                  </div>
                </div>

                {/* Adjust Y */}
                <div className="flex flex-col">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>Y Coord</span>
                    <span className="text-amber-300 font-black">{localY}px</span>
                  </div>
                  <div className="flex gap-1 mt-1 justify-between">
                    <button onClick={() => setLocalY(p => p - 10)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">-10</button>
                    <button onClick={() => setLocalY(p => p - 1)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">-1</button>
                    <button onClick={() => setLocalY(p => p + 1)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">+1</button>
                    <button onClick={() => setLocalY(p => p + 10)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">+10</button>
                  </div>
                </div>
              </div>

              {/* Opponent Box */}
              <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-900/50 flex flex-col gap-1.5">
                <div className="font-extrabold text-purple-300 border-b border-purple-900/40 pb-0.5">👥 OPPONENT POD (TOP)</div>
                
                {/* Adjust X */}
                <div className="flex flex-col">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>X Coord</span>
                    <span className="text-amber-300 font-black">{oppX}px</span>
                  </div>
                  <div className="flex gap-1 mt-1 justify-between">
                    <button onClick={() => setOppX(p => p - 10)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">-10</button>
                    <button onClick={() => setOppX(p => p - 1)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">-1</button>
                    <button onClick={() => setOppX(p => p + 1)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">+1</button>
                    <button onClick={() => setOppX(p => p + 10)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">+10</button>
                  </div>
                </div>

                {/* Adjust Y */}
                <div className="flex flex-col">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>Y Coord</span>
                    <span className="text-amber-300 font-black">{oppY}px</span>
                  </div>
                  <div className="flex gap-1 mt-1 justify-between">
                    <button onClick={() => setOppY(p => p - 10)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">-10</button>
                    <button onClick={() => setOppY(p => p - 1)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">-1</button>
                    <button onClick={() => setOppY(p => p + 1)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">+1</button>
                    <button onClick={() => setOppY(p => p + 10)} className="flex-1 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-extrabold cursor-pointer">+10</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer display values to copy */}
            <div className="flex items-center justify-between bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800">
              <code className="text-[8px] text-gray-400 font-mono select-all">
                L:({localX},{localY}) / O:({oppX},{oppY})
              </code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`Local: X={${localX}} Y={${localY}} \| Opponent: X={${oppX}} Y={${oppY}}`);
                  alert("Copied coordinates to clipboard!");
                }}
                className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-[8px] font-black text-slate-900 cursor-pointer uppercase tracking-wider"
              >
                Copy Coords
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LuxuryLiveCamera;
