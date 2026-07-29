import React from 'react';
import { getBadgeColorsForLevel } from '../utils/level';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, size = 'md', className = '' }) => {
  const badgeColors = getBadgeColorsForLevel(level);

  const sizeClasses = {
    sm: 'w-8 h-8 text-[9px]',
    md: 'w-12 h-12 text-xs',
    lg: 'w-16 h-16 text-lg',
  };

  return (
    <div
      className={`rounded-full bg-gradient-to-br ${badgeColors} border-2 flex items-center justify-center font-black shadow-lg animate-pulse-soft flex-shrink-0 ${sizeClasses[size]} ${className}`}
      style={{ animationDuration: '4s' }}
    >
      <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] font-sans italic">
        {level}
      </span>
    </div>
  );
};
export default LevelBadge;
