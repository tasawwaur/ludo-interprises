import React from 'react';

interface SettingsButtonProps {
  onClick?: () => void;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-[44px] h-[44px] rounded-full bg-[rgba(20,12,40,0.85)] border border-[rgba(255,255,255,0.12)] flex items-center justify-center text-lg shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-[18px] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
      title="Settings"
    >
      ⚙️
    </button>
  );
};
