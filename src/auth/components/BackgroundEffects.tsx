import React from 'react';

export const BackgroundEffects: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#12061F]">
      {/* Luxury Triple Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#12061F] via-[#3A103A] to-[#5B174D] opacity-90"></div>

      {/* Ludo Board Pattern Overlay (Faint) */}
      <div className="absolute inset-0 opacity-5 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)]" style={{ backgroundSize: '60px 60px', backgroundPosition: '0 0, 30px 30px' }}></div>

      {/* Ambient Purple/Amber Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-amber-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#5B174D]/50 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Floating 3D Ludo Pawns */}
      <div className="absolute top-[15%] left-[10%] text-7xl opacity-50 transform -rotate-12 drop-shadow-2xl animate-[bounce_4s_infinite]">
        🔵
      </div>
      <div className="absolute top-[18%] right-[12%] text-7xl opacity-50 transform rotate-12 drop-shadow-2xl animate-[bounce_5s_infinite_0.5s]">
        🔴
      </div>
      <div className="absolute bottom-[22%] left-[15%] text-7xl opacity-50 transform rotate-6 drop-shadow-2xl animate-[bounce_4.5s_infinite_1s]">
        🟢
      </div>
      <div className="absolute bottom-[15%] right-[10%] text-7xl opacity-50 transform -rotate-15 drop-shadow-2xl animate-[bounce_6s_infinite_1.5s]">
        🟡
      </div>

      {/* Floating Dice at Corners */}
      <div className="absolute top-[8%] left-[8%] text-6xl opacity-40 drop-shadow-xl animate-[spin_10s_linear_infinite]">
        🎲
      </div>
      <div className="absolute bottom-[10%] right-[8%] text-5xl opacity-40 drop-shadow-xl animate-[spin_12s_linear_infinite_reverse]">
        🎲
      </div>

      {/* Scattered Gold Coins with Bounce Animations */}
      <div className="absolute top-[30%] right-[25%] text-4xl opacity-60 drop-shadow-xl animate-[bounce_3s_infinite]">
        🪙
      </div>
      <div className="absolute top-[60%] left-[20%] text-3xl opacity-60 drop-shadow-xl animate-[bounce_3.5s_infinite_0.2s]">
        🪙
      </div>
      <div className="absolute bottom-[40%] right-[30%] text-5xl opacity-50 drop-shadow-xl animate-[bounce_4s_infinite_0.8s]">
        🪙
      </div>
      <div className="absolute top-[45%] left-[5%] text-4xl opacity-40 drop-shadow-xl animate-[bounce_5s_infinite_1.2s]">
        🪙
      </div>
    </div>
  );
};
