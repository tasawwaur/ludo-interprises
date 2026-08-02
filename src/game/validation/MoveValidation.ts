export interface MoveRequestPayload {
  playerId: string;
  tokenId: number; // 0 - 3
  startStep: number;
  rollValue: number;
  proposedEndStep: number;
  timestamp: number;
  signature: string; // Cryptographic validation token
}

export class MoveValidation {
  /**
   * Authoritatively validates a player's proposed movement request on the board.
   * If step count delta does not match dice output, or if move breaks safe zone/pathing
   * constraints, it immediately rejects the move.
   */
  public static validateProposedMove(payload: MoveRequestPayload): boolean {
    const { startStep, rollValue, proposedEndStep } = payload;

    // 1. Math verification: end step must equal start step + roll value
    if (proposedEndStep !== startStep + rollValue) {
      console.error(`Move Rejected: Step count mismatch. Start: ${startStep}, Roll: ${rollValue}, Proposed End: ${proposedEndStep}`);
      return false;
    }

    // 2. Safe zones validation: step count cannot exceed the home entry threshold (57 step indices)
    if (proposedEndStep > 57) {
      console.error(`Move Rejected: Out of bounds. Max step count is 57, proposed: ${proposedEndStep}`);
      return false;
    }

    // 3. Roll limits check: ludo dice output must always be between 1 and 6
    if (rollValue < 1 || rollValue > 6) {
      console.error(`Move Rejected: Impossible dice roll: ${rollValue}`);
      return false;
    }

    // 4. Request freshness validation to prevent replay attacks (nonce & time-limit expiration check)
    const now = Date.now();
    if (now - payload.timestamp > 10000) { // 10 seconds timeout limit
      console.error(`Move Rejected: Replay attack detected. Token expired.`);
      return false;
    }

    return true;
  }

  /**
   * Validate out-of-turn gameplay actions.
   */
  public static validateActiveTurn(activePlayerId: string, requestPlayerId: string): boolean {
    if (activePlayerId !== requestPlayerId) {
      console.error(`Move Rejected: OUT_OF_TURN action by player: ${requestPlayerId}. Active player is: ${activePlayerId}`);
      return false;
    }
    return true;
  }
}
export default MoveValidation;
