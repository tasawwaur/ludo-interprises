export type CurrencyType = 'star' | 'energy' | 'coin' | 'gem';

export interface CurrencyItem {
  id: CurrencyType;
  label: string;
  value: string | number;
  icon: string;
  badgeColor: string;
  borderColor: string;
  backgroundColor?: string;
  showPlus?: boolean;
  animated?: boolean;
}

export interface EventItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  requiredLevel: number;
  isLocked: boolean;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
  reward?: string;
  timer?: string;
  badge?: string;
  actionText?: string;
  animation?: 'pulse' | 'float' | 'none';
}

export interface GameModeItem {
  id: string;
  modeKey: string;
  title: string;
  subtitle: string;
  icon: string;
  isHero?: boolean;
  badgeText?: string;
  requiredLevel?: number;
  isLocked?: boolean;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
}

export type NavTabType = 'shop' | 'friends' | 'home' | 'rewards' | 'profile';

export interface NavItem {
  id: NavTabType;
  label: string;
  icon: string;
  badge?: string;
  isHome?: boolean;
}

export interface UserHomeProfile {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  level: number;
  xpPercent: number;
  isOnline: boolean;
  country?: string;
}

export interface HomePageData {
  profile: UserHomeProfile;
  currencies: CurrencyItem[];
  events: EventItem[];
  gameModes: GameModeItem[];
  navItems: NavItem[];
}
