import React from 'react';
import { useLevel } from '../hooks/useLevel';
import { XPBar } from '../components/XPBar';

interface XPWidgetProps {
  onClick?: () => void;
}

export const XPWidget: React.FC<XPWidgetProps> = ({ onClick }) => {
  const { levelState } = useLevel();

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-purple-950/60 border border-purple-800/40 rounded-2xl p-3 flex flex-col gap-2 hover:scale-[1.01] active:scale-95 transition-transform"
    >
      <div className="flex justify-between items-center">
        <span className="text-[9px] text-purple-300 font-bold uppercase tracking-wider">Level {levelState.currentLevel}</span>
        <span className="text-[10px] text-amber-200 font-black">{levelState.title}</span>
      </div>
      <XPBar currentXp={levelState.currentXp} requiredXp={levelState.xpRequiredForNextLevel} />
    </button>
  );
};
export default XPWidget;
