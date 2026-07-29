export interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq_1',
    category: 'Gameplay',
    question: 'How do I roll the dice?',
    answer: 'Simply tap the active 3D dice on the bottom-right of the game board when it is your turn.',
  },
  {
    id: 'faq_2',
    category: 'Economy',
    question: 'How can I unlock new dice skins?',
    answer: 'Go to the shop or inventory, select your desired skin, and purchase it using your earned Coins or Gems.',
  },
  {
    id: 'faq_3',
    category: 'Tournaments',
    question: 'What happens if I disconnect during a tournament match?',
    answer: 'Leaving or disconnecting from an active tournament match will forfeit the entry fee and record a loss.',
  },
  {
    id: 'faq_4',
    category: 'Progression',
    question: 'How do I level up my profile?',
    answer: 'Earn Experience Points (XP) by completing daily quests, winning matches, and claiming login streak stars.',
  },
];

export const getFaqByCategory = (category: string): FAQItem[] => {
  return FAQ_DATA.filter((item) => item.category.toLowerCase() === category.toLowerCase());
};

export const searchFaqs = (query: string): FAQItem[] => {
  const q = query.toLowerCase();
  return FAQ_DATA.filter(
    (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
  );
};
