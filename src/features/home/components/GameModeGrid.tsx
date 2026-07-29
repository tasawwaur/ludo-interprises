import React from 'react';

interface GameModeGridProps {
  onSelectMode: (modeKey: string) => void;
}

export const GameModeGrid: React.FC<GameModeGridProps> = ({ onSelectMode }) => {
  const modes = [
    {
      id: 'private_table',
      modeKey: 'Private Table',
      title: 'PRIVATE TABLE',
      imgSrc: '/assets/images/home/cards/private_table.png',
    },
    {
      id: 'team_up',
      modeKey: '2v2 Team Up',
      title: 'TEAM UP',
      imgSrc: '/assets/images/home/cards/team_up.png',
    },
    {
      id: 'vip',
      modeKey: 'VIP Lounge',
      title: 'VIP ROOM',
      imgSrc: '/assets/images/home/cards/vip_room.png',
    },
    {
      id: 'streak_stars',
      modeKey: 'Streak Stars',
      title: 'STREAK STARS',
      imgSrc: '/assets/images/home/cards/streak_stars.png',
    },
    {
      id: 'tournament',
      modeKey: 'Tournament',
      title: 'TOURNAMENT',
      imgSrc: '/assets/images/home/cards/tournament.png',
    },
    {
      id: '4p',
      modeKey: '4P Classic',
      title: '4 PLAYER',
      imgSrc: '/assets/images/home/cards/four_player.png',
    },
  ];

  return (
    <div className="w-full grid grid-cols-2 gap-2">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onSelectMode(mode.modeKey)}
          className="w-full h-[72px] relative rounded-[14px] overflow-hidden hover:scale-[1.03] active:scale-95 transition-transform duration-150 shadow-[0_4px_12px_rgba(0,0,0,0.6)] cursor-pointer bg-transparent border-0 outline-none p-0"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <img
            src={mode.imgSrc}
            alt={mode.title}
            className="w-full h-full object-fill rounded-[14px]"
          />
        </button>
      ))}
    </div>
  );
};
