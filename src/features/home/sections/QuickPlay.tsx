import React from "react";
import { Card, Button, Title, Subtitle, Grid } from "../../../components/ui";

export const QuickPlay: React.FC<{ onSelectMode: (mode: string) => void }> = ({ onSelectMode }) => (
  <Card variant="solid" className="p-6">
    <Title className="text-xl mb-1">🎮 Quick Play Arena</Title>
    <Subtitle className="mb-6">Select mode to jump straight into action</Subtitle>
    
    <Grid cols={4} className="gap-4">
      <button
        onClick={() => onSelectMode("2P Classic")}
        className="group flex flex-col items-center p-5 bg-gradient-to-b from-indigo-900/40 to-slate-900 hover:from-indigo-600 hover:to-purple-600 border border-indigo-500/20 rounded-3xl transition-all duration-300 active:scale-95"
      >
        <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">⚔️</span>
        <span className="font-extrabold text-white text-sm">2 Player</span>
        <span className="text-[11px] text-slate-400 group-hover:text-indigo-200">1v1 Duel</span>
      </button>

      <button
        onClick={() => onSelectMode("4P Battle")}
        className="group flex flex-col items-center p-5 bg-gradient-to-b from-purple-900/40 to-slate-900 hover:from-purple-600 hover:to-pink-600 border border-purple-500/20 rounded-3xl transition-all duration-300 active:scale-95"
      >
        <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">👑</span>
        <span className="font-extrabold text-white text-sm">4 Player</span>
        <span className="text-[11px] text-slate-400 group-hover:text-purple-200">Classic Battle</span>
      </button>

      <button
        onClick={() => onSelectMode("Practice AI")}
        className="group flex flex-col items-center p-5 bg-gradient-to-b from-emerald-900/40 to-slate-900 hover:from-emerald-600 hover:to-teal-600 border border-emerald-500/20 rounded-3xl transition-all duration-300 active:scale-95"
      >
        <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">🤖</span>
        <span className="font-extrabold text-white text-sm">vs AI Bot</span>
        <span className="text-[11px] text-slate-400 group-hover:text-emerald-200">Offline Practice</span>
      </button>

      <button
        onClick={() => onSelectMode("Custom Room")}
        className="group flex flex-col items-center p-5 bg-gradient-to-b from-amber-900/40 to-slate-900 hover:from-amber-500 hover:to-orange-500 border border-amber-500/20 rounded-3xl transition-all duration-300 active:scale-95"
      >
        <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">🔑</span>
        <span className="font-extrabold text-white text-sm">Custom Room</span>
        <span className="text-[11px] text-slate-400 group-hover:text-amber-950">Play with Friends</span>
      </button>
    </Grid>
  </Card>
);
