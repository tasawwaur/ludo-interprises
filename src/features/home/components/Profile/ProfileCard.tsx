import React from 'react';
import { useUserStore } from '../../../../user/user.store';
import { usePlayerStatsStore } from '../../../../store/player-stats.store';
import { Avatar } from './Avatar';
import { UserInfo } from './UserInfo';
import { LevelBadge } from './LevelBadge';
import { XPBar } from './XPBar';

interface ProfileCardProps {
  onOpenSettings?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ onOpenSettings }) => {
  const user = useUserStore((s) => s.user);
  const { stats } = usePlayerStatsStore();

  const displayName = user?.displayName || user?.username || 'TASAVVUR MALIK';
  const level = stats.level;
  const avatar = user?.avatar;
  const country = user?.country || '🇮🇳';

  return (
    <div className="w-full bg-[rgba(30,15,45,0.75)] border border-[rgba(255,255,255,0.12)] rounded-[26px] p-4 shadow-[0_25px_60px_rgba(0,0,0,0.35)] backdrop-blur-[20px] flex flex-col gap-3 relative overflow-hidden">
      {/* Top Row: Avatar (96x96) & User Details */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <Avatar src={avatar} size={96} onEditClick={onOpenSettings} />
          <UserInfo
            displayName={displayName}
            userId="93847283"
            league="Diamond II"
            country={country}
          />
        </div>

        {/* Level Badge Top-Right */}
        <div className="self-start mt-1">
          <LevelBadge level={level} />
        </div>
      </div>

      {/* XP Progress Bar Row */}
      <XPBar currentXp={stats.xp} requiredXp={stats.nextLevelXp} level={stats.level} />

      {/* Bottom Action Row: Edit Profile Button */}
      <div className="flex items-center justify-end border-t border-purple-500/20 pt-2 mt-1">
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-400/50 text-amber-300 font-extrabold text-xs shadow hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <span>✏️</span>
          <span>Edit Profile</span>
        </button>
      </div>
    </div>
  );
};
