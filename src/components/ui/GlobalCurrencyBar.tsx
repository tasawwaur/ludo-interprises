import React from 'react';
import { useUserStore } from '../../user/user.store';

const fmt = (val: number): string => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toLocaleString();
};

export const GlobalCurrencyBar: React.FC = () => {
  const user = useUserStore((s) => s.user);
  if (!user) return null;

  const coins  = user.coins  ?? 0;
  const gems   = user.gems   ?? 0;
  const crowns = user.crowns ?? 0;

  return (
    <div className="absolute top-2 right-2 z-[60] flex items-center gap-1.5 pointer-events-none select-none">

      {/* Crowns */}
      <div className="flex items-center bg-slate-950/90 border border-yellow-400/50 rounded-xl px-2 py-0.5 shadow-lg gap-1">
        <img src="/assets/images/icons/icon_gem.png" className="w-4 h-4 object-contain" alt="Crowns" />
        <span className="text-[9.5px] font-black text-amber-300">{fmt(crowns)}</span>
      </div>

      {/* Coins */}
      <div className="flex items-center bg-slate-950/90 border border-amber-400/50 rounded-xl px-2 py-0.5 shadow-lg gap-1">
        <img src="/assets/images/icons/icon_coin.png" className="w-4 h-4 object-contain" alt="Coins" />
        <span className="text-[9.5px] font-black text-yellow-400">{fmt(coins)}</span>
      </div>

      {/* Gems */}
      <div className="flex items-center bg-slate-950/90 border border-purple-400/50 rounded-xl px-2 py-0.5 shadow-lg gap-1">
        <img src="/assets/images/icons/icon_diamond.png" className="w-4 h-4 object-contain" alt="Gems" />
        <span className="text-[9.5px] font-black text-purple-300">{fmt(gems)}</span>
      </div>

    </div>
  );
};
