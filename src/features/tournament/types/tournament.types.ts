export type TournamentStatus = 'REGISTERING' | 'RUNNING' | 'FINISHED';

export interface TournamentEntryCost {
  coins?: number;
  gems?: number;
}

export interface TournamentItem {
  id: string;
  name: string;
  description: string;
  status: TournamentStatus;
  entryCost: TournamentEntryCost;
  prizePool: string;
  totalParticipants: number;
  maxParticipants: number;
  registeredCount: number;
  currentRound: number;
  totalRounds: number;
  startTime: string;
  endTime: string;
}
