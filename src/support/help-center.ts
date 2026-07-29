import { FAQ_DATA, FAQItem } from './faq';
import { SUPPORT_CHANNELS, ContactChannels } from './contact-us';

export interface HelpCenterInfo {
  channels: ContactChannels;
  faqs: FAQItem[];
}

export const getHelpCenterInfo = (): HelpCenterInfo => {
  return {
    channels: SUPPORT_CHANNELS,
    faqs: FAQ_DATA,
  };
};
