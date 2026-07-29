import React from 'react';
import { OnlineDot } from './OnlineDot';

interface AvatarProps {
  src?: string;
  size?: number;
  onEditClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({ src, size = 96, onEditClick }) => {
  return (
    <div className="relative group cursor-pointer" onClick={onEditClick}>
      {/* 96x96 Circular Photo with Gold Ring */}
      <div
        style={{ width: `${size}px`, height: `${size}px` }}
        className="rounded-full border-2 border-[#ffd54f] overflow-hidden shadow-2xl bg-slate-900 flex items-center justify-center text-3xl transition-transform group-hover:scale-105"
      >
        {src ? (
          <img src={src} alt="Profile Avatar" className="w-full h-full object-cover" />
        ) : (
          <span>👤</span>
        )}
      </div>

      {/* Green Online Dot Top-Right */}
      <div className="absolute top-0 right-0">
        <OnlineDot />
      </div>

      {/* 📷 Camera Edit Overlay Icon Bottom-Right */}
      <button
        type="button"
        onClick={onEditClick}
        className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border border-slate-900 text-slate-950 font-bold text-xs flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform"
      >
        📷
      </button>
    </div>
  );
};
