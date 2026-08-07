import React, { useState, useEffect, useRef } from "react";
import { VoiceChatService } from "../../game/sound/VoiceChatService";
import { useGameStore } from "../../store/game.store";
import { useRoomStore } from "../../store/room.store";

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
  opponentVideoFrame?: string | null;
}

const CameraPod: React.FC<CameraPodProps> = ({
  playerName, playerAvatar, defaultX, defaultY, isLocal, localVideoRef,
  camOn, paused, micOn, onToggleCam, onTogglePause, onToggleMic,
  opponentVideoFrame
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
            className="w-full h-full object-cover scale-x-[-1] absolute inset-0"
          />
        )}

        {/* Video stream for opponent */}
        {!isLocal && camOn && opponentVideoFrame && (
          <img
            src={opponentVideoFrame}
            alt="Opponent live stream"
            className="w-full h-full object-cover scale-x-[-1] absolute inset-0 z-10"
          />
        )}

        {/* Avatar placeholder when camera OFF or opponent is not streaming */}
        {(!camOn || paused || (!isLocal && !opponentVideoFrame)) && (
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
        {((isLocal && camOn && !paused) || (!isLocal && camOn && opponentVideoFrame)) && (
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

        {/* 🎙️ Opponent micro indicator when talking */}
        {!isLocal && micOn && (
          <div className="absolute bottom-2 left-2 z-30 pointer-events-none">
            <span className="w-5 h-5 rounded-full bg-emerald-500/90 border border-emerald-300 flex items-center justify-center text-[10px] animate-pulse">
              🎙️
            </span>
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
  voiceMuted?: boolean;
}

export const LuxuryLiveCamera: React.FC<LuxuryLiveCameraProps> = ({
  localPlayer,
  opponentPlayer,
  isOneVsOne,
  voiceMuted,
}) => {
  if (!isOneVsOne) return null;

  const gameSocket = useGameStore((s: any) => s.gameSocket);
  const roomCode = useRoomStore((s: any) => s.roomCode) || localStorage.getItem('ludo_classic_room_code');
  const localPlayerColor = useGameStore((s: any) => s.localPlayerColor);

  const handleToggleMic = () => {
    setLocalMicOn((p) => !p);
  };

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

  // Opponent States
  const [opponentCamOn, setOpponentCamOn] = useState(false);
  const [opponentVideoFrame, setOpponentVideoFrame] = useState<string | null>(null);
  const [opponentMicOn, setOpponentMicOn] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef     = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const oppHeartbeatRef = useRef<any>(null);
  const oppMicHeartbeatRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => {
      const checkMobile = window.innerWidth <= 640 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
      setIsMobile(checkMobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive coordinate settings
  const localX = isMobile ? 213 : 201;
  const localY = isMobile ? 428 : 358;
  const oppX = isMobile ? 8 : -2;
  const oppY = isMobile ? 223 : 153;

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

  // Webcam stream activation
  useEffect(() => {
    if (localCamOn && !localPaused) {
      (async () => {
        try {
          if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
          streamRef.current = stream;
          if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        } catch (e) { console.warn("Camera getUserMedia error:", e); }
      })();
    } else {
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
    }
    return () => {
      if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    };
  }, [localCamOn, localPaused]);

  // Real-time video frame streaming loop (base64 via socket)
  useEffect(() => {
    if (!localCamOn || localPaused || !gameSocket || !roomCode) return;

    const interval = setInterval(() => {
      if (localVideoRef.current && localVideoRef.current.readyState === 4) {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = 120;
        canvas.height = 120;
        canvasRef.current = canvas;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(localVideoRef.current, 0, 0, 120, 120);
          // Compress frame to low-res JPEG
          const base64Frame = canvas.toDataURL('image/jpeg', 0.45);
          gameSocket.emit('client_action', {
            roomCode,
            actionType: 'STREAM_VIDEO',
            videoFrame: base64Frame,
            senderColor: localPlayerColor
          });
        }
      }
    }, 150); // 6.5 FPS for light network consumption

    return () => clearInterval(interval);
  }, [localCamOn, localPaused, gameSocket, roomCode, localPlayerColor]);

  // Microphone capture and streaming loop (MediaRecorder)
  useEffect(() => {
    if (!localMicOn || !gameSocket || !roomCode) {
      if (mediaRecorderRef.current) {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
        mediaRecorderRef.current = null;
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }
      return;
    }

    let active = true;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
        });
        if (!active) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        audioStreamRef.current = stream;

        // Try getting a supported browser mimeType for audio
        let mimeType = 'audio/webm;codecs=opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/ogg;codecs=opus';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = ''; // Let browser fall back
        }

        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        recorder.ondataavailable = async (e) => {
          if (e.data.size > 0 && gameSocket && roomCode) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64Audio = reader.result;
              gameSocket.emit('client_action', {
                roomCode,
                actionType: 'STREAM_AUDIO',
                audioChunk: base64Audio,
                senderColor: localPlayerColor
              });
            };
            reader.readAsDataURL(e.data);
          }
        };

        recorder.start(350); // 350ms chunks for low voice chat latency
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.warn("Microphone access error:", err);
      }
    })();

    return () => {
      active = false;
      if (mediaRecorderRef.current) {
        try { mediaRecorderRef.current.stop(); } catch (e) {}
        mediaRecorderRef.current = null;
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(t => t.stop());
        audioStreamRef.current = null;
      }
    };
  }, [localMicOn, gameSocket, roomCode, localPlayerColor]);

  // Voice volume analysis fallback (updates VoiceChatService active state)
  useEffect(() => {
    if (localMicOn) {
      VoiceChatService.startMicrophone().catch(() => {});
    } else {
      VoiceChatService.stopMicrophone();
    }
  }, [localMicOn]);

  // Receive media stream socket events (video image frame & voice chunks)
  useEffect(() => {
    const handleIncomingMedia = (e: Event) => {
      const data = (e as CustomEvent).detail;
      if (!data || data.senderColor === localPlayerColor) return;

      if (data.actionType === 'STREAM_VIDEO') {
        setOpponentVideoFrame(data.videoFrame);
        setOpponentCamOn(true);

        // Heartbeat timer to detect opponent camera stops
        if (oppHeartbeatRef.current) clearTimeout(oppHeartbeatRef.current);
        oppHeartbeatRef.current = setTimeout(() => {
          setOpponentCamOn(false);
          setOpponentVideoFrame(null);
        }, 1200);
      }

      if (data.actionType === 'STREAM_AUDIO') {
        setOpponentMicOn(true);

        // Playback opponent voice chunk if not muted by local settings
        if (data.audioChunk && !voiceMuted) {
          const audio = new Audio(data.audioChunk);
          audio.volume = 1.0;
          audio.play().catch(() => {});
        }

        // Heartbeat timer to detect opponent microphone mute
        if (oppMicHeartbeatRef.current) clearTimeout(oppMicHeartbeatRef.current);
        oppMicHeartbeatRef.current = setTimeout(() => {
          setOpponentMicOn(false);
        }, 1500);
      }
    };

    window.addEventListener('game_media_stream', handleIncomingMedia);
    return () => {
      window.removeEventListener('game_media_stream', handleIncomingMedia);
      if (oppHeartbeatRef.current) clearTimeout(oppHeartbeatRef.current);
      if (oppMicHeartbeatRef.current) clearTimeout(oppMicHeartbeatRef.current);
    };
  }, [localPlayerColor]);

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
        micOn={opponentMicOn}
        opponentVideoFrame={opponentVideoFrame}
      />
    </>
  );
};

export default LuxuryLiveCamera;
