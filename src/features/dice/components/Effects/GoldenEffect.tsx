import React from 'react';

export const GoldenEffect: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden z-10">
      <div className="absolute inset-0 border-2 border-yellow-400 animate-pulse opacity-60"></div>
      {/* Tiny gold speck particles */}
      <span className="absolute top-1 left-2 text-[6px] text-yellow-300 animate-bounce">✨</span>
      <span className="absolute bottom-2 right-3 text-[6px] text-yellow-200 animate-pulse">✨</span>
    </div>
  );
};
export default GoldenEffect;
