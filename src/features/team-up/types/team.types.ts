export type TeamColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW';
export type TeamSize = 2 | 3 | 4;

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  maxSize: TeamSize;
  color: TeamColor;
  isReady: boolean;
  createdAt: string;
}
