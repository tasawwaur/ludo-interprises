export interface AuthFeature {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

export interface SocialProvider {
  id: 'google' | 'apple' | 'facebook';
  name: string;
  icon: string;
  bgClass: string;
  textClass: string;
}
