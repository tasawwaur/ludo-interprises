export interface PlayerProfile {
  id: string;
  name: string;
  color: 'RED' | 'GREEN';
  avatarUrl?: string;
  isNpc: boolean;
}

export const PLAYER_ONE_DEFAULT: PlayerProfile = {
  id: 'user_1',
  name: 'YOU',
  color: 'RED',
  isNpc: false,
};
