import React from 'react';

interface GlowEffectProps {
  color?: 'amber' | 'purple' | 'green';
  className?: string;
}

export const GlowEffect: React.FC<GlowEffectProps> = ({ color = 'amber', className = '' }) => {
  const colorMap = {
    amber: 'bg-amber-500/10 blur-2xl animate-pulse-soft',
    purple: 'bg-purple-500/10 blur-3xl animate-pulse-soft',
    green: 'bg-emerald-500/10 blur-2xl animate-pulse-soft',
  };

  return (
    <div className={`absolute pointer-events-none rounded-full w-64 h-64 ${colorMap[color]} ${className}`} />
  );
};
export default GlowEffect;
