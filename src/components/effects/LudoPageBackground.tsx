import React from 'react';

type BackgroundVariant =
  | 'home'
  | 'shop'
  | 'friends'
  | 'rewards'
  | 'profile'
  | 'settings'
  | 'tournament'
  | 'room'
  | 'gameplay'
  | 'victory'
  | 'leaderboard';

interface LudoPageBackgroundProps {
  variant: BackgroundVariant;
  className?: string;
  children?: React.ReactNode;
}

export const LudoPageBackground: React.FC<LudoPageBackgroundProps> = ({
  variant,
  className = '',
  children,
}) => {
  // Setup variant-specific styling configurations
  const variantStyles: Record<
    BackgroundVariant,
    {
      gradient: string;
      glowColor: string;
      floatElements: { icon: string; style: React.CSSProperties; anim: string }[];
      accentText?: string;
    }
  > = {
    home: {
      gradient: 'from-[#1D0933] via-[#320C4F] to-[#12061F]',
      glowColor: 'bg-purple-500/10',
      floatElements: [],
      accentText: '',
    },
    shop: {
      gradient: 'from-[#0A1128] via-[#101F42] to-[#0D0A1C]',
      glowColor: 'bg-blue-500/10',
      floatElements: [
        { icon: '💎', style: { top: '18%', left: '10%', fontSize: '1.8rem' }, anim: 'animate-float-slow' },
        { icon: '🪙', style: { top: '30%', right: '14%', fontSize: '1.6rem' }, anim: 'animate-float-mid' },
        { icon: '💰', style: { bottom: '28%', left: '12%', fontSize: '1.5rem' }, anim: 'animate-float-fast' },
        { icon: '💎', style: { bottom: '40%', right: '8%', fontSize: '1.3rem' }, anim: 'animate-float-slow' },
      ],
      accentText: 'SHOP LOBBY',
    },
    friends: {
      gradient: 'from-[#032326] via-[#150B2B] to-[#0A0414]',
      glowColor: 'bg-teal-500/10',
      floatElements: [
        { icon: '👥', style: { top: '16%', left: '8%', fontSize: '1.6rem' }, anim: 'animate-float-slow' },
        { icon: '🟢', style: { top: '35%', right: '12%', fontSize: '1.4rem' }, anim: 'animate-float-mid' },
        { icon: '⭐', style: { bottom: '24%', left: '18%', fontSize: '1.8rem' }, anim: 'animate-float-fast' },
        { icon: '🟡', style: { bottom: '38%', right: '10%', fontSize: '1.5rem' }, anim: 'animate-float-slow' },
      ],
      accentText: 'PLAYERS HUB',
    },
    rewards: {
      gradient: 'from-[#3D1E0A] via-[#24062B] to-[#120419]',
      glowColor: 'bg-amber-500/10',
      floatElements: [
        { icon: '🎁', style: { top: '14%', left: '12%', fontSize: '2.0rem' }, anim: 'animate-float-slow' },
        { icon: '🪙', style: { top: '28%', right: '8%', fontSize: '1.5rem' }, anim: 'animate-float-mid' },
        { icon: '🎡', style: { bottom: '26%', left: '14%', fontSize: '1.8rem' }, anim: 'animate-float-fast' },
        { icon: '⭐', style: { bottom: '38%', right: '12%', fontSize: '1.6rem' }, anim: 'animate-float-slow' },
      ],
      accentText: 'LUCKY CLUB',
    },
    profile: {
      gradient: 'from-[#330522] via-[#24063D] to-[#12061F]',
      glowColor: 'bg-pink-500/10',
      floatElements: [
        { icon: '👑', style: { top: '15%', left: '8%', fontSize: '1.8rem' }, anim: 'animate-float-slow' },
        { icon: '🏆', style: { top: '30%', right: '10%', fontSize: '1.7rem' }, anim: 'animate-float-mid' },
        { icon: '⭐', style: { bottom: '22%', left: '15%', fontSize: '1.5rem' }, anim: 'animate-float-fast' },
        { icon: '🔴', style: { bottom: '42%', right: '12%', fontSize: '1.4rem' }, anim: 'animate-float-slow' },
      ],
      accentText: 'CHAMPION STAGE',
    },
    settings: {
      gradient: 'from-[#191124] via-[#0F0819] to-[#07030D]',
      glowColor: 'bg-slate-500/5',
      floatElements: [
        { icon: '⚙️', style: { top: '20%', left: '12%', fontSize: '1.8rem' }, anim: 'animate-float-slow' },
        { icon: '🔒', style: { top: '35%', right: '10%', fontSize: '1.4rem' }, anim: 'animate-float-mid' },
        { icon: '⚙️', style: { bottom: '30%', left: '14%', fontSize: '1.5rem' }, anim: 'animate-float-fast' },
      ],
      accentText: 'SETTINGS CONTROL',
    },
    tournament: {
      gradient: 'from-[#38040C] via-[#1C0526] to-[#0A0112]',
      glowColor: 'bg-rose-500/10',
      floatElements: [
        { icon: '🏆', style: { top: '12%', left: '10%', fontSize: '2.0rem' }, anim: 'animate-float-slow' },
        { icon: '🎟️', style: { top: '28%', right: '12%', fontSize: '1.6rem' }, anim: 'animate-float-mid' },
        { icon: '👑', style: { bottom: '25%', left: '15%', fontSize: '1.8rem' }, anim: 'animate-float-fast' },
        { icon: '🪙', style: { bottom: '38%', right: '8%', fontSize: '1.5rem' }, anim: 'animate-float-slow' },
      ],
      accentText: 'GRAND LEAGUE',
    },
    room: {
      gradient: 'from-[#2A043C] via-[#12061F] to-[#05010A]',
      glowColor: 'bg-purple-500/15',
      floatElements: [
        { icon: '🎲', style: { top: '15%', left: '6%', fontSize: '1.8rem' }, anim: 'animate-float-slow' },
        { icon: '⏳', style: { top: '32%', right: '14%', fontSize: '1.5rem' }, anim: 'animate-float-mid' },
        { icon: '🔵', style: { bottom: '24%', left: '12%', fontSize: '1.5rem' }, anim: 'animate-float-fast' },
        { icon: '🟡', style: { bottom: '40%', right: '10%', fontSize: '1.4rem' }, anim: 'animate-float-slow' },
      ],
      accentText: 'MATCH ROOM',
    },
    gameplay: {
      gradient: 'from-[#052618] via-[#100C1F] to-[#080312]',
      glowColor: 'bg-emerald-500/10',
      floatElements: [
        { icon: '🎲', style: { top: '8%', left: '4%', fontSize: '1.4rem' }, anim: 'animate-float-slow' },
        { icon: '👑', style: { top: '10%', right: '4%', fontSize: '1.4rem' }, anim: 'animate-float-mid' },
      ],
      accentText: 'LUDO FIELD',
    },
    victory: {
      gradient: 'from-[#4D320A] via-[#1F082B] to-[#0E0317]',
      glowColor: 'bg-amber-500/20',
      floatElements: [
        { icon: '✨', style: { top: '10%', left: '15%', fontSize: '2.0rem' }, anim: 'animate-float-slow' },
        { icon: '🪙', style: { top: '25%', right: '15%', fontSize: '1.8rem' }, anim: 'animate-float-mid' },
        { icon: '🏆', style: { bottom: '30%', left: '12%', fontSize: '2.2rem' }, anim: 'animate-float-fast' },
        { icon: '✨', style: { bottom: '40%', right: '10%', fontSize: '1.6rem' }, anim: 'animate-float-slow' },
      ],
      accentText: 'VICTORY ARENA',
    },
    leaderboard: {
      gradient: 'from-[#3D2905] via-[#24063D] to-[#12061F]',
      glowColor: 'bg-yellow-500/10',
      floatElements: [
        { icon: '👑', style: { top: '15%', left: '8%', fontSize: '1.8rem' }, anim: 'animate-float-slow' },
        { icon: '🏆', style: { top: '30%', right: '12%', fontSize: '1.6rem' }, anim: 'animate-float-mid' },
        { icon: '🪙', style: { bottom: '26%', left: '14%', fontSize: '1.5rem' }, anim: 'animate-float-fast' },
      ],
      accentText: 'HALL OF FAME',
    },
  };

  const bgImages: Record<BackgroundVariant, string> = {
    home: '/assets/images/home/home_background.webp',
    shop: '/assets/images/shop/shop_background.webp',
    friends: '/assets/images/friends/friends_background.webp',
    rewards: '/assets/images/rewards/rewards_background.webp',
    profile: '/assets/images/profile/profile_background.webp',
    settings: '/assets/images/settings/settings_background.webp',
    tournament: '/assets/images/tournament/tournament_background.webp',
    room: '/assets/images/private-room/private_room_background.webp',
    gameplay: '/assets/images/practice/practice_background.webp',
    victory: '/assets/images/rewards/rewards_background.webp',
    leaderboard: '/assets/images/leaderboard/leaderboard_background.webp',
  };

  const currentStyles = variantStyles[variant];

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden z-0 w-full h-full bg-gradient-to-b ${currentStyles.gradient} ${className}`}>
      {/* Optional generated high-quality WebP artwork overlay */}
      <img
        src={bgImages[variant]}
        alt={`${variant} background artwork`}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-100"
      />

      {/* 1. Ludo board grid texture overlay */}
      <div className="absolute inset-0 opacity-15 ludo-grid-texture z-10"></div>

      {/* 2. central rotating texture ring */}
      <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full border-[3px] border-dashed border-white/5 opacity-[0.06] animate-rotation-slow z-10"></div>

      {/* 3. Ambient Pulsing Glow Orbs */}
      <div className={`absolute top-10 left-1/4 w-72 h-72 rounded-full blur-3xl animate-pulse-soft ${currentStyles.glowColor} z-10`}></div>
      <div className={`absolute bottom-20 right-1/4 w-80 h-80 rounded-full blur-3xl animate-pulse-soft ${currentStyles.glowColor} z-10`}></div>

      {/* 4. Large LUDO watermark text */}
      {currentStyles.accentText && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center opacity-[0.03] select-none z-10">
          <span className="text-8xl font-black tracking-widest text-white block">LUDO</span>
          <span className="text-6xl font-black tracking-widest text-yellow-300 block -mt-4">
            {currentStyles.accentText.split(' ')[1] || 'LEGENDS'}
          </span>
        </div>
      )}

      {/* 5. 3D Floating Assets */}
      {currentStyles.floatElements.map((el, i) => (
        <span
          key={i}
          className={`absolute opacity-20 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] select-none z-10 ${el.anim}`}
          style={el.style}
        >
          {el.icon}
        </span>
      ))}

      {/* 6. Decorative corner graphics */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-yellow-500/25 rounded-tl-2xl m-2 z-10"></div>
      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-yellow-500/25 rounded-tr-2xl m-2 z-10"></div>
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-yellow-500/25 rounded-bl-2xl m-2 z-10"></div>
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-yellow-500/25 rounded-br-2xl m-2 z-10"></div>
    </div>
  );
};
