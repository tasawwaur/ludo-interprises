import React from 'react';
import { useDice } from '../hooks/useDice';

export const PreviewWidget: React.FC = () => {
  const { equippedDice } = useDice();

  if (!equippedDice) return null;

  return (
    <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-lg relative select-none animate-bounce">
      🎲
    </div>
  );
};
export default PreviewWidget;
