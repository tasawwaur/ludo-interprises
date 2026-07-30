import React from 'react';
import { useUserStore } from '../../user/user.store';

const fmt = (val: number): string => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
  return val.toLocaleString();
};

interface GlobalCurrencyBarProps {
  onOpenShop?: () => void;
}

export const GlobalCurrencyBar: React.FC<GlobalCurrencyBarProps> = ({ onOpenShop }) => {
  const user = useUserStore((s) => s.user);
  if (!user) return null;

  const coins  = user.coins  ?? 0;
  const gems   = user.gems   ?? 0;
  const crowns = user.crowns ?? 0;

  return (
    <button
      onClick={() => onOpenShop?.()}
      className="absolute top-[18px] right-[26px] z-[60] flex items-center gap-3.5 pointer-events-auto cursor-pointer hover:scale-[1.05] active:scale-95 transition-all border-0 outline-none p-0 bg-transparent select-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
      aria-label="Open Shop"
    >

      {/* Crowns */}
      <div className="flex items-center gap-1">
        <img src="/assets/images/icons/icon_gem.png" className="w-4 h-4 object-contain" alt="Crowns" />
        <span className="text-[10px] font-black text-amber-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">{fmt(crowns)}</span>
      </div>

      {/* Coins */}
      <div className="flex items-center gap-1">
        <img src="/assets/images/icons/icon_coin.png" className="w-4 h-4 object-contain" alt="Coins" />
        <span className="text-[10px] font-black text-yellow-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">{fmt(coins)}</span>
      </div>

      {/* Gems */}
      <div className="flex items-center gap-1">
        <img src="/assets/images/icons/icon_diamond.png" className="w-4 h-4 object-contain" alt="Gems" />
        <span className="text-[10px] font-black text-purple-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">{fmt(gems)}</span>
      </div>

    </button>
  );
};
