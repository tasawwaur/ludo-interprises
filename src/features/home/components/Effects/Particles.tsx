import React from 'react';

export const Particles: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-12 left-10 w-2 h-2 rounded-full bg-amber-400/40 animate-ping"></div>
      <div className="absolute top-1/3 right-12 w-3 h-3 rounded-full bg-purple-400/30 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-16 w-2 h-2 rounded-full bg-yellow-300/40 animate-ping"></div>
    </div>
  );
};
