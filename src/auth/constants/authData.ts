import { AuthFeature, SocialProvider } from '../types/auth.types';

export class AuthData {
  static readonly SOCIAL_PROVIDERS: SocialProvider[] = [
    { id: 'google', name: 'Google', icon: '🌐', bgClass: 'bg-white', textClass: 'text-slate-900' },
    { id: 'apple', name: 'Apple', icon: '🍎', bgClass: 'bg-black border border-slate-700', textClass: 'text-white' },
    { id: 'facebook', name: 'Facebook', icon: '📘', bgClass: 'bg-blue-600', textClass: 'text-white' },
  ];

  static readonly FEATURES: AuthFeature[] = [
    {
      id: 'secure',
      icon: '🛡️',
      title: 'SECURE LOGIN',
      subtitle: '100% Safe & Secure',
    },
    {
      id: 'quick',
      icon: '⚡',
      title: 'QUICK ACCESS',
      subtitle: 'Login in a second',
    },
    {
      id: 'play_win',
      icon: '🏆',
      title: 'PLAY & WIN',
      subtitle: 'Become the Legend',
    },
  ];
}
