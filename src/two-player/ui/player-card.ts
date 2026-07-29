import { PlayerProfile } from '../players/player-one';

export interface PlayerCardData {
  profile: PlayerProfile;
  isReady: boolean;
  isHost: boolean;
  avatarEmoji: string;
}

const AVATAR_EMOJIS: Record<string, string> = {
  RED: '🔴',
  GREEN: '🟢',
};

export const buildPlayerCard = (
  profile: PlayerProfile,
  isReady: boolean,
  isHost: boolean
): PlayerCardData => ({
  profile,
  isReady,
  isHost,
  avatarEmoji: AVATAR_EMOJIS[profile.color] ?? '👤',
});
