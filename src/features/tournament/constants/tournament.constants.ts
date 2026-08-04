import { TournamentItem } from '../types/tournament.types';

export const INITIAL_TOURNAMENTS: TournamentItem[] = [
  {
    id: 'tour_16p_championship',
    name: '16-PLAYER CHAMPIONSHIP',
    description: 'High stakes tournament. 16 players, 4 rounds of single-elimination battles. 2-Player mode.',
    status: 'REGISTERING',
    entryCost: { coins: 10000 },
    prizePool: '🪙 80,000 + 👑 5',
    totalParticipants: 16,
    maxParticipants: 16,
    registeredCount: 15, // So the user will be the 16th and it will start!
    currentRound: 1,
    totalRounds: 4, // 16 players -> 4 rounds (Round of 16, Quarterfinals, Semifinals, Finals)
    startTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tour_weekend_masters',
    name: 'WEEKEND MASTERS',
    description: 'Conquer the board in this single-elimination weekend cup to claim exclusive crown trophies.',
    status: 'REGISTERING',
    entryCost: { gems: 10 },
    prizePool: '💎 200 + 👑 5',
    totalParticipants: 8,
    maxParticipants: 8,
    registeredCount: 4,
    currentRound: 1,
    totalRounds: 3, // 8 players -> 3 rounds (8, 4, 2)
    startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tour_quick_knockout',
    name: 'QUICK KNOCKOUT',
    description: 'Fast matches with low stakes. Perfect for a quick challenge.',
    status: 'RUNNING',
    entryCost: { coins: 50 },
    prizePool: '🪙 400',
    totalParticipants: 4,
    maxParticipants: 4,
    registeredCount: 4,
    currentRound: 2,
    totalRounds: 2, // 4 players -> 2 rounds
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  },
];
