import React from 'react';
import { LevelBadge as PremiumLevelBadge } from '../../../components/badges/LevelBadge';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  return (
    <PremiumLevelBadge 
      level={level} 
      size={sizeMap[size]} 
      className={className} 
    />
  );
};

export default LevelBadge;
