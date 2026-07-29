import React from 'react';
import { EventItem } from '../types/home.types';

interface EventCardProps {
  event: EventItem;
  onClick?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center bg-gradient-to-br ${event.bgGradient} border-2 ${event.borderColor} rounded-2xl p-2.5 min-w-[90px] h-[68px] shadow-xl hover:scale-105 transition-transform active:scale-95`}
    >
      <span className={`text-xs font-black ${event.accentColor} tracking-widest drop-shadow`}>
        {event.title}
      </span>
      {event.isLocked && (
        <span className={`text-[10px] bg-slate-950/90 ${event.accentColor} font-black px-2 py-0.5 rounded-full mt-1 flex items-center gap-0.5 border border-purple-400/30`}>
          🔒 Level {event.requiredLevel}
        </span>
      )}
    </button>
  );
};
