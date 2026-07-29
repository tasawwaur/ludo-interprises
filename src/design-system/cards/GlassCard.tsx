import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div
      className={`bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-[24px] p-4 backdrop-blur-[18px] shadow-[0_15px_40px_rgba(0,0,0,0.35)] ${className}`}
    >
      {children}
    </div>
  );
};
