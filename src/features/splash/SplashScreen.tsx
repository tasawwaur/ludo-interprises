import React, { useEffect, useState } from "react";

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => onFinish?.(), 400);
          return 100;
        }
        return prev + 1.2;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="w-full min-h-screen h-screen bg-[#07010E] text-white flex flex-col items-center justify-between relative overflow-hidden select-none font-sans">
      {/* 1. 3D AAA Background Image */}
      <img
        src="/splash_bg.png"
        alt="Ludo Legends Splash Background"
        className="w-full h-full object-fill z-0"
      />

      {/* 3. Nokia Retro Style Snake crawling around the Ludo Board */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 400 800" fill="none">
          <defs>
            <linearGradient id="snakeHeadGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
 
            <filter id="snakeGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
 
          {/* Slithering Snake Path across the Ludo Board */}
          <g filter="url(#snakeGlow)">
            <path
              d="M 70 460 L 330 460 L 330 580 L 70 580 Z"
              stroke="#FACC15"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="40 240"
              className="animate-[nokiaSnake_3.5s_linear_infinite]"
            />
            <path
              d="M 70 460 L 330 460 L 330 580 L 70 580 Z"
              stroke="#FEF08A"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="20 260"
              className="animate-[nokiaSnake_3.5s_linear_infinite]"
            />
          </g>
        </svg>
      </div>

      {/* 4. Golden Loading Bar Track at Bottom */}
      <div
        className="absolute z-20 w-[78%] max-w-[325px] h-[11px] rounded-full border border-[#AA7C11]/80 bg-black/40 backdrop-blur-[1px] p-[1.5px] pointer-events-none"
        style={{ bottom: "7.3%", left: "50%", transform: "translateX(-50%)" }}
      >
        <div
          className="h-full bg-gradient-to-r from-[#AA7C11] via-[#FDF0A6] to-[#BC8F27] rounded-full shadow-[0_0_8px_rgba(253,240,166,0.8)] transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <style>{`
        @keyframes nokiaSnake {
          0% { stroke-dashoffset: 280; }
          100% { stroke-dashoffset: -280; }
        }
      `}</style>
    </div>
  );
};
