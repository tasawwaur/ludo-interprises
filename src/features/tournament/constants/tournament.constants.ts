import { TournamentItem } from '../types/tournament.types';

export const INITIAL_TOURNAMENTS: TournamentItem[] = [
  {
    id: 'tour_312_league',
    name: '312 LEAGUE GRAND',
    description: 'The supreme championship for elite Ludo tacticians. Test your skill against 120 global grandmasters!',
    status: 'REGISTERING',
    entryCost: { coins: 500 },
    prizePool: '🪙 50,000 + 👑 10',
    totalParticipants: 128,
    maxParticipants: 128,
    registeredCount: 96,
    currentRound: 1,
    totalRounds: 7, // 128 players -> 7 rounds (128, 64, 32, 16, 8, 4, 2)
    startTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // starts in 15 mins
    endTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
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
