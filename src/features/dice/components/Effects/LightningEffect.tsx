import React from 'react';

export const LightningEffect: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden z-10">
      <div className="absolute inset-0 border-2 border-cyan-400 animate-pulse opacity-70"></div>
      <div className="absolute top-1 left-1/3 right-1/3 h-[2px] bg-cyan-200 blur-[1px] animate-pulse"></div>
    </div>
  );
};
export default LightningEffect;
