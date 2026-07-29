import React from 'react';
import { CurrencyItem as CurrencyItemType } from '../../types/home.types';

interface CurrencyItemProps {
  item: CurrencyItemType;
  onAddClick?: () => void;
}

export const CurrencyItem: React.FC<CurrencyItemProps> = ({ item, onAddClick }) => {
  return (
    <div className="h-[40px] flex items-center gap-1.5 bg-[rgba(20,12,40,0.85)] border border-[rgba(255,255,255,0.12)] rounded-[18px] px-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-[18px]">
      <span className="text-base drop-shadow">{item.icon}</span>
      <span className={`text-xs font-black ${item.badgeColor} tracking-wide`}>{item.value}</span>
      {item.showPlus && (
        <button
          onClick={onAddClick}
          className="ml-1 w-5 h-5 rounded-full bg-[#00d26a] text-slate-950 font-black text-xs flex items-center justify-center shadow hover:scale-125 transition-transform cursor-pointer"
        >
          +
        </button>
      )}
    </div>
  );
};
