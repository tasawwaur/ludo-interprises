import React from 'react';
import { GameCard } from './GameCard';

interface GameGridProps {
  onSelectMode: (modeKey: string) => void;
}

export const GameGrid: React.FC<GameGridProps> = ({ onSelectMode }) => {
  const modes = [
    {
      id: 'private_table',
      modeKey: 'Private Table',
      title: 'Private Table',
      subtitle: 'Play with Friends',
      icon: '🏠🔒',
      bgClass: 'bg-gradient-to-br from-purple-700 to-purple-950',
      borderColor: 'border-purple-400',
      accentColor: 'text-purple-200',
    },
    {
      id: 'team_up',
      modeKey: '2v2 Team Up',
      title: 'Team Up',
      subtitle: '2 vs 2',
      icon: '👥',
      bgClass: 'bg-gradient-to-br from-teal-500 to-cyan-800',
      borderColor: 'border-cyan-300',
      accentColor: 'text-cyan-100',
    },
    {
      id: 'vip',
      modeKey: 'VIP Lounge',
      title: 'VIP Room',
      subtitle: 'High Stakes',
      icon: '👑',
      bgClass: 'bg-gradient-to-br from-yellow-500 to-amber-700',
      borderColor: 'border-yellow-300',
      accentColor: 'text-yellow-100',
    },
    {
      id: 'streak_stars',
      modeKey: 'Streak Stars',
      title: 'Streak Stars',
      subtitle: 'Win Streak Rewards',
      icon: '⭐',
      bgClass: 'bg-gradient-to-br from-blue-500 to-indigo-800',
      borderColor: 'border-blue-300',
      accentColor: 'text-blue-100',
    },
    {
      id: 'tournament',
      modeKey: 'Tournament',
      title: 'Tournament',
      subtitle: 'Big Prizes',
      icon: '🏆',
      bgClass: 'bg-gradient-to-br from-pink-500 to-magenta-800',
      borderColor: 'border-pink-300',
      accentColor: 'text-pink-100',
    },
    {
      id: '4p',
      modeKey: '4P Classic',
      title: '4 Player',
      subtitle: 'Play with All',
      icon: '🎲',
      bgClass: 'bg-gradient-to-br from-lime-500 to-green-800',
      borderColor: 'border-lime-300',
      accentColor: 'text-lime-100',
    },
  ];

  return (
    <div className="w-full max-w-lg grid grid-cols-2 gap-3 my-1">
      {modes.map((mode) => (
        <GameCard
          key={mode.id}
          title={mode.title}
          subtitle={mode.subtitle}
          icon={mode.icon}
          bgClass={mode.bgClass}
          borderColor={mode.borderColor}
          accentColor={mode.accentColor}
          onClick={() => onSelectMode(mode.modeKey)}
        />
      ))}
    </div>
  );
};
