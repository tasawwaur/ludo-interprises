import { Team } from './team.types';
import { TeamMember } from './member.types';

export type LobbyStatus = 'WAITING' | 'READY' | 'STARTING' | 'IN_GAME';

export interface Lobby {
  id: string;
  team: Team;
  members: TeamMember[];
  status: LobbyStatus;
  gameMode: string;
  entryFeeCoins: number;
  startCountdown: number | null;
  createdAt: string;
}
