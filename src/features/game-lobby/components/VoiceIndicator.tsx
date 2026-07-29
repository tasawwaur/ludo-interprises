import React, { useState } from 'react';

export const VoiceIndicator: React.FC = () => {
  const [isVoiceOn, setIsVoiceOn] = useState(true);

  return (
    <button
      onClick={() => setIsVoiceOn(!isVoiceOn)}
      className={`px-3 py-1.5 rounded-xl border font-black text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer ${
        isVoiceOn
          ? 'bg-emerald-950/80 border-[#00d26a] text-[#00d26a]'
          : 'bg-slate-900 border-slate-700 text-slate-400'
      }`}
    >
      <span>{isVoiceOn ? '🎤 ON' : '🔇 OFF'}</span>
    </button>
  );
};

export const PingIndicator: React.FC<{ pingMs?: number }> = ({ pingMs = 28 }) => {
  const colorClass =
    pingMs < 50 ? 'text-[#00d26a]' : pingMs < 100 ? 'text-yellow-400' : 'text-rose-500';

  return (
    <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-purple-500/40 text-xs font-black flex items-center gap-1.5 shadow">
      <span>📶</span>
      <span className={colorClass}>{pingMs} ms</span>
    </div>
  );
};
