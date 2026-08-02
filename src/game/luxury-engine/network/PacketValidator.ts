import { MultiplayerAction } from '../types';

export class PacketValidator {
  /**
   * Performs validation check on incoming multiplayer action envelopes.
   */
  public static isPacketCorrupt(action: MultiplayerAction): boolean {
    if (!action.playerId || !action.type || action.timestamp <= 0) {
      return true;
    }
    return false;
  }
}
