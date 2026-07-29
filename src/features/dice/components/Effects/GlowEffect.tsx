import React from 'react';

interface GlowEffectProps {
  color?: string;
  className?: string;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({ color = 'purple', className = '' }) => {
  const colorMap: Record<string, string> = {
    purple: 'bg-purple-500/10 blur-2xl animate-pulse-soft',
    blue: 'bg-blue-500/10 blur-2xl animate-pulse-soft',
    red: 'bg-red-500/10 blur-2xl animate-pulse-soft',
    gold: 'bg-yellow-500/10 blur-2xl animate-pulse-soft',
  };

  return (
    <div className={`absolute rounded-full w-48 h-48 pointer-events-none ${colorMap[color] || colorMap.purple} ${className}`} />
  );
};
export default GlowEffect;
