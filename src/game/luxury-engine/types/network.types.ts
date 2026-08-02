export interface MultiplayerAction {
  type: 'ROLL' | 'MOVE' | 'RECONNECT' | 'TIMEOUT';
  playerId: string;
  payload: any;
  timestamp: number;
  actionIndex: number; // Sequenced index for state reconciliation
}
