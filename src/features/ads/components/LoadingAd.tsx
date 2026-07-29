import React from 'react';

export const LoadingAd: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-4 bg-black/20 rounded-xl gap-2.5">
      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Loading Advertisement...</span>
    </div>
  );
};
export default LoadingAd;
