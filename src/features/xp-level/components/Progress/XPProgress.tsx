import React from 'react';
import { XPBar } from '../XPBar';

interface XPProgressProps {
  currentXp: number;
  requiredXp: number;
}

export const XPProgress: React.FC<XPProgressProps> = ({ currentXp, requiredXp }) => {
  return (
    <div className="w-full bg-purple-950/30 border border-purple-900/30 rounded-2xl p-4 shadow-md">
      <XPBar currentXp={currentXp} requiredXp={requiredXp} />
    </div>
  );
};
export default XPProgress;
