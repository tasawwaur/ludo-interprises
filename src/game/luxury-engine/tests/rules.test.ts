import { MoveValidator } from '../rules/MoveValidator';
import { Token } from '../types';

describe('MoveValidator Tests', () => {
  it('should identify that token in yard needs a 6 to exit', () => {
    const mockToken: Token = {
      id: 'token_1',
      color: 'RED',
      index: 0,
      position: -1,
      stepCount: 0,
      state: 'YARD',
    };

    const mockGameState: any = {
      players: [
        {
          id: 'player_1',
          name: 'P1',
          color: 'RED',
          tokens: [mockToken],
        },
      ],
      activePlayerIndex: 0,
    };

    // Roll 5 -> should return null (cannot move)
    const moveWith5 = MoveValidator.evaluateTokenMove(mockGameState, 'RED', mockToken, 5);
    expect(moveWith5).toBeNull();

    // Roll 6 -> should exit to step 1
    const moveWith6 = MoveValidator.evaluateTokenMove(mockGameState, 'RED', mockToken, 6);
    expect(moveWith6).not.toBeNull();
    expect(moveWith6?.toStep).toBe(1);
  });
});
