import React from 'react';
import { AuthData } from '../constants/authData';

export const BottomFeatures: React.FC = () => {
  // Using explicit feature list from instructions to ensure exact match, ignoring AuthData mapping if it misaligns
  const features = [
    { id: 'secure', title: 'SECURE LOGIN', subtitle: '100% Safe & Secure', icon: '🛡️' },
    { id: 'quick', title: 'QUICK ACCESS', subtitle: 'Login in a second', icon: '⚡' },
    { id: 'play', title: 'PLAY & WIN', subtitle: 'Become the Legend', icon: '🏆' },
  ];

  return (
    <div className="w-full max-w-[400px] mx-auto grid grid-cols-3 gap-3 mt-4 mb-8 z-10">
      {features.map((feat) => (
        <div
          key={feat.id}
          className="flex flex-col items-center justify-center text-center p-3 bg-gradient-to-b from-[#2A0B34]/80 to-[#12061F]/80 border border-[#5B174D] rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.5)] backdrop-blur-md hover:scale-105 hover:border-purple-400/50 transition-all cursor-default group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3A103A] to-[#12061F] border border-[#5B174D] group-hover:border-amber-500/50 flex items-center justify-center text-xl shadow-inner mb-2 transition-colors">
            <span className="drop-shadow-md group-hover:scale-110 transition-transform">
              {feat.icon}
            </span>
          </div>
          <span className="text-[10px] font-black text-amber-100 tracking-wider uppercase block leading-tight mb-0.5">
            {feat.title}
          </span>
          <span className="text-[9px] font-semibold text-purple-300 block leading-tight">
            {feat.subtitle}
          </span>
        </div>
      ))}
    </div>
  );
};
