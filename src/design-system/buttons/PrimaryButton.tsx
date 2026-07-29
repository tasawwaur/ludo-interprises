import React from 'react';

interface PrimaryButtonProps {
  label: string;
  icon?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  icon = '▶',
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`py-3 px-6 rounded-[18px] bg-gradient-to-r from-[#ffd54f] via-amber-400 to-[#ff9800] border border-yellow-200 text-slate-950 font-black text-sm tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_15px_40px_rgba(0,0,0,0.35)] hover:scale-105 active:scale-95 transition-all cursor-pointer ${className}`}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </button>
  );
};
