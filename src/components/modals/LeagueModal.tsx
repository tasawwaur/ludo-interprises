import React from 'react';
import { Card, Button, Title, Subtitle, Avatar, Badge, Flex } from '../ui';

interface LeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeagueModal: React.FC<LeagueModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const leaderboardPlayers = [
    { rank: 1, name: 'الجنّي البريطاني', earning: '35 M', tier: 'SKILLED - II', flag: '🇬🇧' },
    { rank: 2, name: 'Phyrnai Syiem', earning: '30 M', tier: 'PROFESSIONAL - I', flag: '🇮🇳' },
    { rank: 3, name: 'BooOoos', earning: '23 M', tier: 'BIGGUN - II', flag: '🇪🇸' },
    { rank: 4, name: 'Ammar Alhatmi', earning: '20 M', tier: 'SEMIPRO - I', flag: '🇴🇲' },
    { rank: 5, name: 'Mashari', earning: '14.01 M', tier: 'GENIUS - II', flag: '🇸🇦' },
    { rank: 6, name: 'Meeeeeem', earning: '11 M', tier: 'HOTSHOT - III', flag: '🇦🇪' },
    { rank: 29, name: 'Player 1 (You)', earning: '67.5 K', tier: 'SKILLED - II', flag: '🇮🇳', isUser: true },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <Card variant="solid" className="max-w-md w-full p-6 border-2 border-purple-500/50 shadow-2xl bg-slate-900/95 relative overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 -mx-6 -mt-6 p-4 mb-4 text-center border-b border-purple-400/30">
          <Badge variant="amber" className="mb-1">Ends in 1 Day 19 Hr</Badge>
          <Title className="text-2xl text-amber-300 font-black tracking-wide">🏆 BRONZE LEAGUE</Title>
          <Subtitle className="text-purple-200 text-xs">Top 5 players promote to Silver League!</Subtitle>
        </div>

        {/* Players Leaderboard List */}
        <div className="flex flex-col gap-2 my-2 max-h-80 overflow-y-auto pr-1">
          {leaderboardPlayers.map((p) => (
            <div
              key={p.rank}
              className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                p.isUser
                  ? 'bg-emerald-900/60 border-emerald-400/80 shadow-lg scale-[1.01]'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <Flex className="gap-3 items-center">
                <span className={`w-6 text-center font-black text-sm ${p.rank <= 3 ? 'text-amber-400' : 'text-slate-400'}`}>
                  #{p.rank}
                </span>
                <Avatar name={p.name} isOnline badge="RED" />
                <div>
                  <span className="font-extrabold text-white text-xs block flex items-center gap-1">
                    <span>{p.flag}</span> {p.name}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold block">{p.tier}</span>
                </div>
              </Flex>

              <Badge variant="amber" className="font-extrabold text-xs">
                💰 {p.earning}
              </Badge>
            </div>
          ))}
        </div>

        <Button variant="neon" size="lg" className="w-full mt-4" onClick={onClose}>
          CLOSE LEAGUE
        </Button>
      </Card>
    </div>
  );
};
