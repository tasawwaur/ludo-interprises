import React from 'react';
import { HomeData } from '../../constants/homeData';
import { CurrencyItem } from './CurrencyItem';

interface CurrencyBarProps {
  onAddCurrency?: (type: string) => void;
}

export const CurrencyBar: React.FC<CurrencyBarProps> = ({ onAddCurrency }) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {HomeData.CURRENCIES.map((curr) => (
        <CurrencyItem
          key={curr.id}
          item={curr}
          onAddClick={() => onAddCurrency?.(curr.id)}
        />
      ))}
    </div>
  );
};
