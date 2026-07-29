import React from 'react';
import { NavigationItem } from './NavigationItem';

interface BottomNavigationProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  onOpenProfileSettings?: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeNav,
  onNavChange,
  onOpenProfileSettings,
}) => {
  const items = [
    { id: 'shop', label: 'SHOP', icon: '🎁', badge: 'NEW' },
    { id: 'friends', label: 'FRIENDS', icon: '👥' },
    { id: 'home', label: 'HOME', icon: '🏠', isHome: true },
    { id: 'rewards', label: 'REWARDS', icon: '🎁', badge: '2' },
    { id: 'profile', label: 'PROFILE', icon: '👤' },
  ];

  return (
    <footer className="w-full max-w-[430px] h-[82px] px-4 bg-[#12061f]/95 border-t-2 border-yellow-500 flex items-center justify-around z-30 backdrop-blur-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] rounded-t-3xl fixed bottom-0">
      {items.map((item) => (
        <NavigationItem
          key={item.id}
          id={item.id}
          label={item.label}
          icon={item.icon}
          badge={item.badge}
          isHome={item.isHome}
          isActive={activeNav === item.id}
          onClick={() => {
            onNavChange(item.id);
            if (item.id === 'profile') {
              onOpenProfileSettings?.();
            }
          }}
        />
      ))}
    </footer>
  );
};
