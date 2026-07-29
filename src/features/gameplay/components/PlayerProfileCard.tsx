import React from 'react';
import { Player } from '../../../game/engine/Engine.types';
import { Card, Flex, Avatar, Badge } from '../../../components/ui';

export const PlayerProfileCard: React.FC<{ player: Player; isActive: boolean }> = ({ player, isActive }) => {
  const homeTokensCount = player.tokens.filter((t) => t.stepCount === 57).length;

  const colorBadgeVariants: Record<string, 'rose' | 'emerald' | 'amber' | 'cyan'> = {
    RED: 'rose',
    GREEN: 'emerald',
    YELLOW: 'amber',
    BLUE: 'cyan',
  };

  return (
    <Card
      variant="glass"
      className={`p-4 transition-all duration-300 ${
        isActive
          ? 'border-2 border-amber-400 bg-slate-800/90 shadow-2xl scale-[1.02] ring-4 ring-amber-400/20'
          : 'border-slate-800 bg-slate-900/60'
      }`}
    >
      <Flex className="justify-between items-center mb-3">
        <Flex className="gap-3 items-center">
          <Avatar name={player.name} isOnline badge={player.color} />
          <div>
            <Flex className="items-center gap-1.5">
              <span className="font-extrabold text-white text-sm block">{player.name}</span>
              {player.isAi && <Badge variant="indigo" className="text-[9px] px-1 py-0">AI</Badge>}
            </Flex>
            <span className="text-[11px] text-slate-400 block font-mono">
              Level {player.level} • Rank #{player.isHost ? '42' : '108'}
            </span>
          </div>
        </Flex>

        <Badge variant={colorBadgeVariants[player.color]}>
          {isActive ? '⚡ TURN' : player.color}
        </Badge>
      </Flex>

      {/* Player Stats Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
        <div>
          <span className="text-slate-400 block">Coins / Gems</span>
          <span className="font-bold text-amber-400">💰 {player.coins.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Win Rate</span>
          <span className="font-bold text-emerald-400">📈 {player.winRate}% ({player.matchesPlayed} M)</span>
        </div>
        <div>
          <span className="text-slate-400 block">Tokens Home</span>
          <span className="font-bold text-indigo-300">🏠 {homeTokensCount} / 4</span>
        </div>
        <div>
          <span className="text-slate-400 block">Status</span>
          <span className="font-bold text-slate-200">🟢 Online</span>
        </div>
      </div>
    </Card>
  );
};
