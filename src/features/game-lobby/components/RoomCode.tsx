import React, { useState } from 'react';

interface RoomCodeProps {
  code: string;
}

export const RoomCode: React.FC<RoomCodeProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-slate-950/80 border border-purple-500/40 rounded-2xl p-3 flex items-center justify-between shadow-lg backdrop-blur-md">
      <div className="flex flex-col text-left">
        <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest">
          ROOM CODE
        </span>
        <span className="text-xl font-black text-amber-300 tracking-widest drop-shadow">
          {code}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-xl bg-purple-900/80 border border-purple-400/50 text-white font-extrabold text-xs shadow hover:scale-105 transition-transform cursor-pointer"
        >
          {copied ? '✓ COPIED' : '📋 COPY'}
        </button>

        <button
          onClick={() => alert(`Room Code ${code} shared!`)}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 border border-emerald-400/50 text-white font-extrabold text-xs shadow hover:scale-105 transition-transform cursor-pointer"
        >
          🔗 SHARE
        </button>
      </div>
    </div>
  );
};
