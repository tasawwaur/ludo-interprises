import React from 'react';

export const FireEffect: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden z-10">
      {/* Visual glowing border representing hot volcanic lava streams */}
      <div className="absolute inset-0 border-2 border-orange-500 animate-pulse opacity-60"></div>
      <div className="absolute bottom-1 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent blur-[2px] animate-bounce"></div>
    </div>
  );
};
export default FireEffect;
