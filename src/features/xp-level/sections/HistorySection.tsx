import React, { useState } from 'react';
import { useXP } from '../hooks/useXP';
import { XPHistory } from '../components/History/XPHistory';

export const HistorySection: React.FC = () => {
  const { xpHistory } = useXP();
  const [filter, setFilter] = useState<'ALL' | 'MATCH' | 'QUEST' | 'BONUS'>('ALL');

  const filteredHistory = xpHistory.filter((entry) => {
    if (filter === 'ALL') return true;
    if (filter === 'MATCH') return entry.source.includes('MATCH');
    if (filter === 'QUEST') return entry.source.includes('QUEST');
    if (filter === 'BONUS') return entry.source.includes('BONUS');
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Category filters */}
      <div className="flex bg-black/40 border border-purple-800/30 rounded-2xl p-1 shadow-inner">
        {(['ALL', 'MATCH', 'QUEST', 'BONUS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
              filter === tab
                ? 'bg-purple-700 text-white shadow-md'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* History log lists */}
      {filteredHistory.length > 0 ? (
        <div className="flex flex-col gap-2 overflow-y-auto no-scrollbar max-h-[350px]">
          <XPHistory history={filteredHistory} />
        </div>
      ) : (
        <div className="text-center py-10 bg-purple-950/20 border border-purple-900/30 rounded-3xl p-6">
          <span className="text-2xl opacity-60">⏳</span>
          <span className="text-[10px] text-purple-300 block mt-2">No historical logs found for this filter.</span>
        </div>
      )}
    </div>
  );
};
export default HistorySection;
