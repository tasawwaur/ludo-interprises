import React, { useState, useEffect, useRef } from "react";

interface LuxuryLiveCameraProps {
  localPlayerName: string;
  localPlayerAvatar: string;
  opponentName: string;
  opponentAvatar: string;
  isOneVsOne: boolean;
}

export const LuxuryLiveCamera: React.FC<LuxuryLiveCameraProps> = ({
  localPlayerName,
  localPlayerAvatar,
  opponentName,
  opponentAvatar,
  isOneVsOne,
}) => {
  if (!isOneVsOne) return null;

  // Camera settings
  const [localCamOn, setLocalCamOn] = useState(false);
  const [localPaused, setLocalPaused] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isMinimized, setIsMinimized] = useState(false);

  // Opponent state (Simulating that opponent mirrors or toggles based on privacy rules)
  const [opponentCamOn, setOpponentCamOn] = useState(false);
  const [opponentPaused, setOpponentPaused] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Dragging coordinates
  const [position, setPosition] = useState({ x: 16, y: 120 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const positionStart = useRef({ x: 0, y: 0 });

  // Double tap checking
  const lastTap = useRef<number>(0);

  // Long press timer reference
  const longPressTimer = useRef<number | null>(null);
  const touchStartTime = useRef<number>(0);

  // Opponent turns camera on automatically 1.5s after both agree
  useEffect(() => {
    if (localCamOn) {
      const timer = setTimeout(() => {
        setOpponentCamOn(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setOpponentCamOn(false);
      setOpponentPaused(false);
    }
  }, [localCamOn]);

  // Turn on/off webcam streams
  useEffect(() => {
    if (localCamOn && !localPaused) {
      startWebcam();
    } else {
      stopWebcam();
    }
    return () => stopWebcam();
  }, [localCamOn, localPaused, facingMode]);

  const startWebcam = async () => {
    try {
      stopWebcam();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false, // Mic is already handled separately
      });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera permission denied or not available:", err);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  // Drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    dragStart.current = { x: touch.clientX, y: touch.clientY };
    positionStart.current = { x: position.x, y: position.y };
    touchStartTime.current = Date.now();

    // Setup Long Press detection (holding for 700ms triggers pause/resume)
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => {
      if (Date.now() - touchStartTime.current >= 600) {
        // Trigger Long Press pause/resume
        setLocalPaused((prev) => !prev);
        // Opponent pauses shortly after to simulate interaction
        setTimeout(() => {
          setOpponentPaused((prev) => !prev);
        }, 1000);
      }
    }, 700);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.current.x;
    const dy = touch.clientY - dragStart.current.y;
    
    // Cancel long press if drag happens
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      if (longPressTimer.current) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }

    setPosition({
      x: positionStart.current.x + dx,
      y: positionStart.current.y + dy,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Auto snap to nearest screen side
    const screenWidth = window.innerWidth;
    const snapX = position.x < screenWidth / 2 ? 16 : screenWidth - 100;
    setPosition((prev) => ({
      ...prev,
      x: snapX,
    }));

    // If tap was quick (no drag, less than 250ms), handle Tap Gesture
    const duration = Date.now() - touchStartTime.current;
    if (duration < 250) {
      handleTapGesture();
    }
  };

  // Mouse drag handlers for desktop support
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    positionStart.current = { x: position.x, y: position.y };
    touchStartTime.current = Date.now();

    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = window.setTimeout(() => {
      setLocalPaused((prev) => !prev);
      setTimeout(() => {
        setOpponentPaused((prev) => !prev);
      }, 1000);
    }, 700);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      if (longPressTimer.current) {
        window.clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }

    setPosition({
      x: positionStart.current.x + dx,
      y: positionStart.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const snapX = position.x < 185 ? 16 : 280; // Snap coordinates for desktop preview size
    setPosition((prev) => ({
      ...prev,
      x: snapX,
    }));

    const duration = Date.now() - touchStartTime.current;
    if (duration < 250) {
      handleTapGesture();
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, position]);

  const handleTapGesture = () => {
    const now = Date.now();
    const delay = now - lastTap.current;
    
    if (delay < 300) {
      // 1. Double Tap -> Switch Front / Rear Camera
      setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    } else {
      // 2. Single Tap -> Toggle Camera ON / OFF
      setLocalCamOn((prev) => !prev);
    }
    lastTap.current = now;
  };

  // Both players must agree condition
  const bothEnabled = localCamOn && opponentCamOn;

  return (
    <div
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: "none",
      }}
      className={`absolute z-[40] flex flex-col gap-2.5 transition-all duration-300 ease-out select-none ${
        isMinimized ? "w-10 h-10" : "w-20"
      }`}
    >
      {/* ── 1. LOCAL PLAYER CAMERA WINDOW ── */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        className={`relative w-[76px] h-[76px] rounded-2xl bg-black border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
          bothEnabled 
            ? "border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]" 
            : "border-purple-600/60 shadow-[0_0_8px_rgba(139,92,246,0.3)]"
        }`}
      >
        {/* Floating animated green dot mic indicator */}
        <div className="absolute top-1 right-1 z-30 flex items-center justify-center gap-0.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping absolute"></span>
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full z-10"></span>
        </div>

        {/* Live Front Camera Stream */}
        {localCamOn && !localPaused && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1] animate-fade-in"
          />
        )}

        {/* Camera OFF Placeholder State */}
        {(!localCamOn || localPaused) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-purple-950/90 relative z-10">
            {/* Profile Picture */}
            <img
              src={localPlayerAvatar || "/assets/images/icons/icon_club_crown.png"}
              alt={localPlayerName}
              className="w-8 h-8 rounded-full border border-amber-400/50 object-cover"
            />
            {/* Tiny animated camera icon */}
            <div className="absolute bottom-1 bg-black/60 px-1 py-0.5 rounded text-[7px] text-gray-300 font-bold uppercase tracking-wider flex items-center gap-0.5 animate-pulse">
              📹 OFF
            </div>
          </div>
        )}

        {/* Paused Overlay */}
        {localCamOn && localPaused && (
          <div className="absolute inset-0 z-25 bg-black/85 flex items-center justify-center">
            <span className="text-[7.5px] font-black uppercase text-rose-500 tracking-widest animate-pulse">
              PAUSED
            </span>
          </div>
        )}

        {/* Network & Device Indicator */}
        {localCamOn && (
          <div className="absolute bottom-1 left-1.5 z-20 flex gap-0.5 items-center">
            <span className="text-[6.5px] text-emerald-400 font-bold">● HD</span>
          </div>
        )}
      </div>

      {/* ── 2. OPPONENT PLAYER CAMERA WINDOW (Rendered only when not minimized) ── */}
      {!isMinimized && (
        <div
          className={`relative w-[76px] h-[76px] rounded-2xl bg-black border-2 transition-all duration-300 overflow-hidden ${
            bothEnabled 
              ? "border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-fade-in" 
              : "border-purple-600/40 opacity-70"
          }`}
        >
          {/* Opponent Webcam Active */}
          {bothEnabled && !opponentPaused ? (
            <div className="w-full h-full relative">
              {/* Simulated Opponent Video Feed */}
              <div className="w-full h-full bg-[#1b0a2c] flex items-center justify-center animate-pulse relative">
                <img 
                  src={opponentAvatar} 
                  alt={opponentName} 
                  className="w-full h-full object-cover blur-[0.5px] opacity-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            </div>
          ) : (
            // Opponent Camera Off State
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-purple-950/80">
              <img
                src={opponentAvatar}
                alt={opponentName}
                className="w-8 h-8 rounded-full border border-purple-500/30 object-cover"
              />
              <div className="absolute bottom-1 bg-black/60 px-1 py-0.5 rounded text-[7px] text-gray-300 font-bold uppercase tracking-wider">
                📹 OFF
              </div>
            </div>
          )}

          {/* Opponent Paused State */}
          {bothEnabled && opponentPaused && (
            <div className="absolute inset-0 z-25 bg-black/85 flex items-center justify-center">
              <span className="text-[7.5px] font-black uppercase text-rose-500 tracking-widest animate-pulse">
                PAUSED
              </span>
            </div>
          )}

          {/* Name Plate */}
          <div className="absolute bottom-1 right-1 z-20 bg-black/50 px-1 rounded">
            <span className="text-[6.5px] font-bold text-gray-300 truncate max-w-[40px] block">
              {opponentName}
            </span>
          </div>
        </div>
      )}

      {/* Minimize/Maximize Controller Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsMinimized((prev) => !prev);
        }}
        className="self-center px-2 py-0.5 bg-black/60 border border-purple-500/30 rounded-md text-[6.5px] font-black text-amber-400 uppercase tracking-widest hover:bg-black active:scale-95 transition-transform"
      >
        {isMinimized ? "🗖 MAX" : "🗕 MIN"}
      </button>
    </div>
  );
};
export default LuxuryLiveCamera;
