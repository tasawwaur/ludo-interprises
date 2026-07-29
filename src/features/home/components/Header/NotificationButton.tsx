import React from 'react';

interface NotificationButtonProps {
  unreadCount?: number;
  onClick?: () => void;
}

export const NotificationButton: React.FC<NotificationButtonProps> = ({
  unreadCount = 5,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className="relative w-[44px] h-[44px] rounded-full bg-[rgba(20,12,40,0.85)] border border-[rgba(255,255,255,0.12)] flex items-center justify-center text-lg shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-[18px] hover:scale-110 active:scale-95 transition-transform cursor-pointer"
      title="Notifications"
    >
      <span>🔔</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-black text-[10px] w-5 h-5 rounded-full border-2 border-[#12061f] flex items-center justify-center shadow animate-pulse">
          {unreadCount}
        </span>
      )}
    </button>
  );
};
