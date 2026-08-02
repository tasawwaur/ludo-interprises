import { PacketValidator } from '../network/PacketValidator';
import { MultiplayerAction } from '../types';

describe('PacketValidator Tests', () => {
  it('should flag corrupt actions', () => {
    const corruptAction: MultiplayerAction = {
      type: 'ROLL',
      playerId: '',
      payload: {},
      timestamp: 0,
      actionIndex: 1,
    };
    
    expect(PacketValidator.isPacketCorrupt(corruptAction)).toBe(true);
  });
});
