export type TwoPlayerEventType =
  | 'DICE_ROLLED'
  | 'TOKEN_MOVED'
  | 'TOKEN_CAPTURED'
  | 'TURN_CHANGED'
  | 'PLAYER_JOINED'
  | 'PLAYER_LEFT'
  | 'MATCH_OVER';

export interface TwoPlayerEvent {
  type: TwoPlayerEventType;
  matchId: string;
  payload: any;
  timestamp: string;
}

export type TwoPlayerEventHandler = (event: TwoPlayerEvent) => void;
