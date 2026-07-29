import React from 'react';
import { CurrencyItem } from '../types/home.types';

interface CurrencyBadgeProps {
  currency: CurrencyItem;
  onAddClick?: () => void;
}

export const CurrencyBadge: React.FC<CurrencyBadgeProps> = ({ currency, onAddClick }) => {
  return (
    <div
      className={`flex items-center bg-slate-950/80 border-2 ${currency.borderColor} rounded-2xl px-2.5 py-1.5 shadow-2xl backdrop-blur-md transition-transform hover:scale-105`}
    >
      <span className="text-base mr-1">{currency.icon}</span>
      <span className={`text-xs font-black ${currency.badgeColor}`}>{currency.value}</span>
      {currency.id !== 'star' && (
        <button
          onClick={onAddClick}
          className="ml-1.5 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-lg hover:scale-125 transition-transform"
        >
          +
        </button>
      )}
    </div>
  );
};
