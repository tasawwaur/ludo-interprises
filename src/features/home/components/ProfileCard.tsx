import React from 'react';
import { useUserStore } from '../../../user/user.store';

interface ProfileCardProps {
  onOpenSettings?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ onOpenSettings }) => {
  const user = useUserStore((s) => s.user);

  // Fallback priority: displayName -> username -> Guest
  const displayName = user?.displayName || user?.username || 'Guest';
  const level = user?.level || 2;
  const avatar = user?.avatar;
  const country = user?.country || '🇮🇳';

  return (
    <div
      onClick={onOpenSettings}
      className="flex items-center gap-2.5 bg-gradient-to-r from-purple-950/95 to-slate-950/95 border-2 border-purple-500/50 rounded-2xl p-2.5 min-w-[170px] shadow-2xl backdrop-blur-md cursor-pointer hover:scale-105 transition-all group"
      title="Click to edit Profile Settings"
    >
      <div className="relative">
        <div className="w-13 h-13 rounded-full bg-slate-200 border-2 border-amber-400 overflow-hidden flex items-center justify-center text-slate-950 font-black text-xl shadow-inner relative">
          {avatar ? (
            <img src={avatar} alt="Profile Avatar" className="w-full h-full object-cover transition-opacity duration-300 animate-in fade-in" />
          ) : (
            <span>👤</span>
          )}
        </div>
        <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full border border-slate-900 shadow">
          Level {level}
        </span>
        {/* Camera Edit Badge Overlay */}
        <span className="absolute -top-1 -right-1 bg-slate-900 border border-amber-400 text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow opacity-80 group-hover:scale-125 transition-transform">
          ✏️
        </span>
      </div>

      <div className="flex flex-col">
        <span className="text-sm font-black text-amber-200 truncate max-w-[90px]">
          {displayName}
        </span>
        <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
          {country} Player
        </span>
        <div className="w-20 h-2 bg-slate-900 rounded-full overflow-hidden border border-purple-400/40 mt-1 shadow-inner">
          <div className="w-2/3 h-full bg-gradient-to-r from-amber-400 to-yellow-300 shadow"></div>
        </div>
      </div>
    </div>
  );
};
