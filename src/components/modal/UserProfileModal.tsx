import React, { useState } from 'react';
import { getFrameFilter } from '../../store/cosmetics.store';

export interface UserStats {
  id: string;
  name: string;
  avatarUrl?: string;
  equippedFrame?: string;
  level: number;
  country: string; // e.g. "INDIA" or "PAKISTAN"
  countryFlag: string; // e.g. "🇮🇳" or "🇵🇰"
  totalEarning: string; // e.g. "8.2 B"
  currentGold: number;
  currentLeague: string; // e.g. "Bronze", "Diamond"
  gamesWon: number;
  gamesPlayed: number;
  teamWins: number;
  winStreak: number;
  twoPlayerWins: number;
  titanBadgeCount: number;
  fourPlayerWins: number;
  killCount: number;
}

interface UserProfileModalProps {
  userStats: UserStats;
  onClose: () => void;
  isMe?: boolean;
  onSendGift?: (type: "COINS" | "GEMS", amount: number) => void;
  onRemove?: () => void;
  onAddFriend?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  userStats, 
  onClose, 
  isMe = false,
  onSendGift,
  onRemove,
  onAddFriend
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [hasSentRequest, setHasSentRequest] = useState((userStats as any).isFriendRequested || false);

  // Derive signature based on level
  const getSignature = (lvl: number) => {
    if (lvl >= 180) return "EMPEROR - III";
    if (lvl >= 150) return "EMPEROR - II";
    if (lvl >= 120) return "EMPEROR - I";
    if (lvl >= 90) return "KING - III";
    if (lvl >= 70) return "KING - I";
    if (lvl >= 50) return "WARRIOR - III";
    if (lvl >= 30) return "WARRIOR - I";
    return "ROOKIE - I";
  };

  const winRate = userStats.gamesPlayed > 0 
    ? Math.round((userStats.gamesWon / userStats.gamesPlayed) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      {/* Outer Card with luxury golden border background */}
      <div 
        style={{ backgroundImage: `url('/assets/images/icons/royal_profile_card_bg.jpg')` }}
        className="w-full max-w-[340px] bg-cover bg-center rounded-[36px] shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-white relative animate-in fade-in zoom-in-95 duration-200 p-6 pt-8 pb-6 border border-yellow-500/20"
      >
        {/* Dark semi-transparent overlay to ensure extreme text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1D0933]/90 via-[#12061F]/95 to-[#0D0A1C]/98 backdrop-blur-[0.5px] rounded-[36px] pointer-events-none z-0"></div>
        
        {/* Close Button: Red-orange square box with dynamic glow */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 w-9 h-9 bg-gradient-to-b from-red-500 to-rose-600 border-[2.5px] border-yellow-400 rounded-xl flex items-center justify-center text-white font-black text-lg hover:brightness-110 active:scale-95 transition-transform z-[1000] shadow-md shadow-black/50"
        >
          ✕
        </button>


        {/* PROFILE HEADER SECTION */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            {/* Circular Avatar with equipped Frame */}
            <div className="w-20 h-20 relative flex-shrink-0">
              <div
                className="absolute rounded-full overflow-hidden bg-slate-950 border border-purple-950 z-10"
                style={{ top: '15%', left: '15%', right: '15%', bottom: '26%' }}
              >
                {userStats.avatarUrl ? (
                  <img src={userStats.avatarUrl} alt={userStats.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center text-2xl font-black text-purple-200">
                    {userStats.name.charAt(0)}
                  </div>
                )}
              </div>
              <img
                src="/assets/images/icons/profile_frame_v3.png"
                alt="Profile Frame"
                className="w-full h-full object-contain absolute inset-0 z-20 pointer-events-none"
                style={{ filter: getFrameFilter(userStats.equippedFrame) }}
                draggable={false}
              />
            </div>

            {/* Name and Country flag */}
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-black text-white drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.8)] tracking-wide">
                {userStats.name}
              </h2>
              <div className="flex items-center gap-1.5 bg-black/35 border border-purple-500/20 px-2 py-0.5 rounded-lg w-max shadow-inner">
                <span className="text-[10px] leading-none">{userStats.countryFlag}</span>
                <span className="text-[7.5px] font-black text-purple-200 uppercase tracking-widest leading-none font-sans">
                  {userStats.country}
                </span>
              </div>
            </div>
          </div>

          {/* Action icon next to name */}
          {!isMe && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!hasSentRequest) {
                  setHasSentRequest(true);
                  onAddFriend?.();
                }
              }}
              className={`w-8 h-8 rounded-xl border flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                hasSentRequest
                  ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-400 font-bold"
                  : "bg-purple-950/70 border-purple-500/30 text-amber-200"
              }`}
              title={hasSentRequest ? "Friend Request Sent" : "Add Friend"}
            >
              {hasSentRequest ? "✔️" : "👤➕"}
            </button>
          )}
        </div>

        {/* TWO COLUMN INFO BOXES */}
        <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
          {/* Column 1 */}
          <div className="flex flex-col gap-2">
            {/* Level Box */}
            <div className="bg-black/30 border border-purple-900/35 rounded-xl px-2.5 py-1.5 h-10 flex flex-col justify-center">
              <span className="text-[7.5px] font-black uppercase text-purple-200 tracking-wider">Level</span>
              <span className="text-xs font-extrabold text-white">{userStats.level}</span>
            </div>
            {/* Total Earning Box */}
            <div className="bg-black/30 border border-purple-900/35 rounded-xl px-2.5 py-1.5 h-10 flex flex-col justify-center">
              <span className="text-[7.5px] font-black uppercase text-purple-200 tracking-wider">Total earning</span>
              <span className="text-xs font-extrabold text-amber-300">{userStats.totalEarning}</span>
            </div>
            {/* Player ID Box */}
            <div className="bg-black/30 border border-purple-900/35 rounded-xl px-2.5 py-1.5 h-10 flex flex-col justify-center">
              <span className="text-[7.5px] font-black uppercase text-purple-200 tracking-wider">Player ID</span>
              <span className="text-[9.5px] font-bold text-gray-200 select-all font-mono">{userStats.id}</span>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-2">
            {/* Signature Box */}
            <div className="bg-black/30 border border-purple-900/35 rounded-xl px-2.5 py-1.5 h-10 flex flex-col justify-center">
              <span className="text-[7.5px] font-black uppercase text-purple-200 tracking-wider">Signature</span>
              <span className="text-xs font-extrabold text-yellow-300 tracking-wide uppercase truncate">
                {getSignature(userStats.level)}
              </span>
            </div>
            {/* Current Gold Box */}
            <div className="bg-black/30 border border-purple-900/35 rounded-xl px-2.5 py-1.5 h-10 flex flex-col justify-center">
              <span className="text-[7.5px] font-black uppercase text-purple-200 tracking-wider">Current gold</span>
              <span className="text-xs font-extrabold text-amber-400 font-mono">
                {userStats.currentGold.toLocaleString()}
              </span>
            </div>
            {/* Current League Box */}
            <div className="bg-black/30 border border-purple-900/35 rounded-xl px-2.5 py-1.5 h-10 flex flex-col justify-center">
              <span className="text-[7.5px] font-black uppercase text-purple-200 tracking-wider">Current League</span>
              <span className="text-[10px] font-extrabold text-blue-300 flex items-center gap-1 uppercase tracking-wide">
                👑 {userStats.currentLeague}
              </span>
            </div>
          </div>
        </div>

        {/* STATS SECTION DIVIDER */}
        <div className="my-4 border-t border-purple-500/20 w-full relative z-10" />

        {/* 2x4 STATS GRID */}
        <div className="grid grid-cols-2 gap-2 mb-2 relative z-10">
          {/* Games Won */}
          <div className="bg-black/30 border border-purple-900/35 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center">
            <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">Games won</span>
            <span className="text-[10.5px] font-extrabold text-white truncate">
              {userStats.gamesWon} of {userStats.gamesPlayed}
            </span>
          </div>
          {/* Team Wins */}
          <div className="bg-black/30 border border-purple-900/35 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center">
            <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">Team wins</span>
            <span className="text-[10.5px] font-extrabold text-white">{userStats.teamWins}</span>
          </div>

          {/* Win Rate */}
          <div className="bg-black/30 border border-purple-900/35 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center">
            <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">Win Rate</span>
            <span className="text-[10.5px] font-extrabold text-white">{winRate} %</span>
          </div>
          {/* Win Streak */}
          <div className="bg-black/30 border border-purple-900/35 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center">
            <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">Win streak</span>
            <span className="text-[10.5px] font-extrabold text-white">{userStats.winStreak}</span>
          </div>

          {/* 2 Player Wins */}
          <div className="bg-black/30 border border-purple-900/35 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center">
            <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">2 Player wins</span>
            <span className="text-[10.5px] font-extrabold text-white">{userStats.twoPlayerWins}</span>
          </div>
          {/* Titan Badge */}
          <div className="bg-black/30 border border-purple-900/35 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center">
            <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">Titan badge</span>
            <span className="text-[10.5px] font-extrabold text-amber-300">{userStats.titanBadgeCount}</span>
          </div>

          {/* 4 Player Wins */}
          <div className="bg-black/30 border border-purple-900/35 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center">
            <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">4 Player wins</span>
            <span className="text-[10.5px] font-extrabold text-white">{userStats.fourPlayerWins}</span>
          </div>
          {/* Kill Count */}
          <div className="bg-black/30 border border-purple-900/35 rounded-xl px-2.5 py-1 h-9 flex flex-col justify-center relative group">
            <span className="text-[7px] font-black uppercase text-purple-200/80 tracking-wider">Kill Count</span>
            <span className="text-[10.5px] font-extrabold text-white">{userStats.killCount}</span>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTON: MUTE */}
        {!isMe && (
          <div className="flex justify-center mt-2 flex-shrink-0 relative z-10">
            <button
              onClick={() => setIsMuted(prev => !prev)}
              className={`w-full py-2 rounded-full font-black text-xs uppercase tracking-widest shadow border transition-all active:scale-95 flex items-center justify-center gap-2 ${
                isMuted 
                  ? "bg-gradient-to-r from-red-500 to-rose-600 text-white border-red-400"
                  : "bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white border-emerald-300"
              }`}
            >
              <span>💬</span>
              <span>{isMuted ? "MUTED" : "MUTE"}</span>
            </button>
          </div>
        )}

        {/* Dynamic Gift / Remove Actions */}
        {!isMe && (onSendGift || onRemove) && (
          <div className="flex flex-col gap-1.5 mt-2.5 pt-2.5 border-t border-pink-500/20 relative z-10">
            <div className="grid grid-cols-2 gap-2">
              {onSendGift && (
                <>
                  <button
                    onClick={() => onSendGift('COINS', 5000)}
                    className="py-1.5 bg-amber-500/10 border border-amber-400/40 text-amber-300 font-black text-[9px] uppercase rounded-xl hover:bg-amber-500/20 active:scale-95 transition-all"
                  >
                    🎁 Gift 5K Gold
                  </button>
                  <button
                    onClick={() => onSendGift('GEMS', 50)}
                    className="py-1.5 bg-blue-500/10 border border-blue-400/40 text-blue-300 font-black text-[9px] uppercase rounded-xl hover:bg-blue-500/20 active:scale-95 transition-all"
                  >
                    🎁 Gift 50 Gems
                  </button>
                </>
              )}
            </div>
            {onRemove && (
              <button
                onClick={onRemove}
                className="w-full py-1.5 bg-rose-600/10 border border-rose-500/30 text-rose-400 font-black text-[9px] uppercase rounded-xl hover:bg-rose-500/20 active:scale-95 transition-all"
              >
                Remove Friend
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
export default UserProfileModal;
