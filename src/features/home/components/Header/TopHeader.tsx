import React from 'react';
import { useUserStore } from '../../../../user/user.store';

interface TopHeaderProps {
  onOpenSettings?: () => void;
  onOpenProfileSettings?: () => void;
  onOpenNotification?: () => void;
  onAddCurrency?: (type: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenSettings,
  onOpenProfileSettings,
  onOpenNotification,
  onAddCurrency,
}) => {
  const user = useUserStore((s) => s.user);

  const displayName = user?.displayName || user?.username || 'Tasavvur';
  const level = user?.level || 25;
  const xp = 75; // 75%
  const avatar = user?.avatar;

  return (
    <header className="w-full flex items-start justify-between z-20 gap-1 pb-2">
      {/* LEFT SIDE */}
      <div className="flex flex-col gap-2">
        {/* Avatar & Info Row */}
        <div className="flex items-center gap-2">
          {/* Avatar with gold ring & online dot */}
          <div className="relative cursor-pointer" onClick={onOpenProfileSettings}>
            <div className="w-12 h-12 rounded-full border-[2px] border-[#FFD54F] p-[1px] shadow-[0_0_8px_rgba(255,213,79,0.6)]">
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-lg">
                  👤
                </div>
              )}
            </div>
            {/* Green dot */}
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-[1.5px] border-[#12061F]"></div>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[13px] font-extrabold text-white drop-shadow tracking-wide">{displayName}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {/* Level badge */}
              <div className="flex items-center gap-0.5 bg-black/40 rounded-full px-1.5 py-[1px] border border-white/10 shadow-inner">
                <span className="text-[9px]">👑</span>
                <span className="text-[10px] font-black text-[#FFD54F]">{level}</span>
              </div>
              {/* XP Bar */}
              <div className="w-12 h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div className="h-full bg-orange-500 rounded-full shadow-[0_0_5px_#f97316]" style={{ width: `${xp}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Message & Friends Row */}
        <div className="flex items-center gap-2 mt-0.5 ml-1">
          {/* Message Icon */}
          <button onClick={onOpenNotification} className="relative bg-black/30 p-1 rounded-full border border-white/10 hover:bg-black/50 transition">
            <span className="text-[11px]">💬</span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-3 h-3 rounded-full flex items-center justify-center border border-[#12061F]">5</span>
          </button>
          
          {/* Friends Online */}
          <button className="flex items-center gap-1 bg-black/30 px-1.5 py-0.5 rounded-full border border-white/10 hover:bg-black/50 transition">
            <span className="text-[11px]">👥</span>
            <span className="text-[9px] font-bold text-green-400">12 Online</span>
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex gap-1.5 items-start">
        {/* Currencies Grid 2x2 */}
        <div className="flex flex-col gap-1.5">
          <CurrencyPill icon="⭐" value="50" onClick={() => onAddCurrency?.('Star')} />
          <CurrencyPill icon="⚡" value="10" onClick={() => onAddCurrency?.('Energy')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <CurrencyPill icon="🪙" value="1000" onClick={() => onAddCurrency?.('Coin')} />
          <CurrencyPill icon="💎" value="30" onClick={() => onAddCurrency?.('Gem')} />
        </div>

        {/* Settings Gear */}
        <button onClick={onOpenSettings} className="bg-black/30 w-[30px] h-[30px] rounded-full border border-white/10 flex items-center justify-center hover:bg-black/50 transition shadow ml-0.5">
          <span className="text-sm">⚙️</span>
        </button>
      </div>
    </header>
  );
};

const CurrencyPill = ({ icon, value, onClick }: { icon: string, value: string, onClick?: () => void }) => (
  <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-full pl-1.5 pr-[2px] py-[2px] w-[60px] backdrop-blur-sm shadow-inner">
    <div className="flex items-center gap-1">
      <span className="text-[10px] drop-shadow-sm">{icon}</span>
      <span className="text-[10px] font-black text-white">{value}</span>
    </div>
    <button onClick={onClick} className="w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center text-[11px] font-black text-[#12061F] ml-0.5 hover:scale-110 shadow-sm border border-green-400">
      +
    </button>
  </div>
);
