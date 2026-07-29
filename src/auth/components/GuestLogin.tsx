import React from 'react';

interface GuestLoginProps {
  onClick: () => void;
}

export const GuestLogin: React.FC<GuestLoginProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-3.5 px-4 bg-[#12061F]/60 border-2 border-[#5B174D]/50 hover:border-purple-400/50 rounded-xl text-purple-200 font-bold text-[14px] flex items-center justify-center gap-2.5 shadow-md hover:bg-[#2A0B34]/80 hover:text-white transition-all group"
    >
      <span className="text-lg opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all">👤</span>
      <span>Login as Guest</span>
    </button>
  );
};
