export interface ContactChannels {
  email: string;
  discord: string;
  telegram: string;
  website: string;
  responseTime: string;
}

export const SUPPORT_CHANNELS: ContactChannels = {
  email: 'support@ludoenterprise.com',
  discord: 'https://discord.gg/ludoenterprise',
  telegram: 'https://t.me/ludoenterprise',
  website: 'https://ludoenterprise.com/support',
  responseTime: 'Usually replies within 24 hours',
};

export const validateContactForm = (email: string, message: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && message.trim().length > 10;
};
