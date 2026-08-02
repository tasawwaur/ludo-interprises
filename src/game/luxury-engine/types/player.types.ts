import { TeamName } from './game.types';
import { Token } from './token.types';

export type PlayerColor = 'RED' | 'GREEN' | 'YELLOW' | 'BLUE';

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  team?: TeamName;
  isAi: boolean;
  isOnline: boolean;
  tokens: Token[];
  level: number;
  winRate: number;
}
