import React from 'react';

export const Glow: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[rgba(168,85,247,0.20)] rounded-full blur-3xl"></div>
    </div>
  );
};
