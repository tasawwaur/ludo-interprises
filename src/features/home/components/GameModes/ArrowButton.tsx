import React from 'react';

interface ArrowButtonProps {
  size?: 'sm' | 'md' | 'lg';
}

export const ArrowButton: React.FC<ArrowButtonProps> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-11 h-11 text-xl',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-white text-slate-950 font-black flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform shrink-0`}
    >
      ➜
    </div>
  );
};
