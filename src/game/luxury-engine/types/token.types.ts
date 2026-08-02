import { PlayerColor } from './player.types';

export type TokenState = 'YARD' | 'TRACK' | 'SAFE_ZONE' | 'HOME_PATH' | 'HOME';

export interface Token {
  id: string;
  color: PlayerColor;
  index: number; // 0 to 3
  position: number; // grid position or track step index (-1 in yard)
  stepCount: number; // 0 to 57
  state: TokenState;
}

export interface MoveableToken {
  tokenId: string;
  fromStep: number;
  toStep: number;
  isCapture: boolean;
  isHome: boolean;
}
