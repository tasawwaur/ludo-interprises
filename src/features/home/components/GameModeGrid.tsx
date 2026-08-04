import React from 'react';
import confetti from 'canvas-confetti';

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

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>, modeKey: string) => {
    // Firing a gold sparkle effect relative to click coordinates
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    confetti({
      particleCount: 22,
      spread: 50,
      origin: { x, y },
      colors: ['#FFD700', '#FFA500', '#FFD54F', '#FFF8DC'], // Luxury golds and yellows
      scalar: 0.85,
      ticks: 60,
    });

    onSelectMode(modeKey);
  };

  return (
    <div className="w-full grid grid-cols-2 gap-2">
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={(e) => handleButtonClick(e, mode.modeKey)}
          className="w-full h-[72px] relative rounded-[14px] overflow-hidden hover:scale-[1.02] active:scale-[0.96] transition-all duration-150 cursor-pointer bg-transparent border-0 outline-none p-0 opacity-85"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          <img
            src={mode.imgSrc}
            alt={mode.title}
            className="w-full h-full object-fill rounded-[14px] filter grayscale-[30%]"
            draggable={false}
          />
          {/* Lock Overlay */}
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[0.5px] flex items-center justify-center rounded-[14px]">
            <span className="bg-slate-900/90 border border-amber-400/80 text-amber-300 text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
              🔒 LOCKED
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
