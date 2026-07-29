export type BadgeType = 'WIN' | 'CAPTURE' | 'SIX' | 'STREAK';

export interface WidgetBadge {
  type: BadgeType;
  label: string;
  emoji: string;
}

export const WIDGET_BADGES: Record<BadgeType, WidgetBadge> = {
  WIN: { type: 'WIN', label: 'Winner!', emoji: '🏆' },
  CAPTURE: { type: 'CAPTURE', label: 'Capture!', emoji: '⚔️' },
  SIX: { type: 'SIX', label: 'Lucky 6!', emoji: '🎲' },
  STREAK: { type: 'STREAK', label: 'On Fire!', emoji: '🔥' },
};

export const getBadgeForEvent = (event: BadgeType): WidgetBadge =>
  WIDGET_BADGES[event];
