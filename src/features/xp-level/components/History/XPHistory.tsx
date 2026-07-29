import React from 'react';
import { XPHistoryEntry } from '../../types/xp.types';
import { formatRelativeTime } from '../../utils/formatter';

interface XPHistoryProps {
  history: XPHistoryEntry[];
}

export const XPHistory: React.FC<XPHistoryProps> = ({ history }) => {
  return (
    <div className="flex flex-col gap-2">
      {history.map((entry) => {
        const isPositive = entry.amount > 0;
        return (
          <div
            key={entry.id}
            className="flex items-center justify-between p-3 bg-purple-950/40 border border-purple-900/40 rounded-2xl"
          >
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">{entry.source.replace('_', ' ')}</span>
              {entry.details && <span className="text-[9px] text-purple-300 italic">{entry.details}</span>}
              <span className="text-[8px] text-gray-400 font-medium mt-1">
                {formatRelativeTime(entry.timestamp)}
              </span>
            </div>
            <span className={`text-xs font-black ${isPositive ? 'text-amber-400' : 'text-rose-500'} font-mono`}>
              {isPositive ? '+' : ''}
              {entry.amount} XP
            </span>
          </div>
        );
      })}
    </div>
  );
};
export default XPHistory;
