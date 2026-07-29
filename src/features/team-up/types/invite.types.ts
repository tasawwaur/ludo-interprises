export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

export interface TeamInvite {
  id: string;
  teamId: string;
  teamName: string;
  fromId: string;
  fromName: string;
  toId: string;
  code: string;
  status: InviteStatus;
  expiresAt: string;
  createdAt: string;
}
