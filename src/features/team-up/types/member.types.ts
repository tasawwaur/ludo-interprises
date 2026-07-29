export type MemberRole = 'LEADER' | 'MEMBER';
export type MemberStatus = 'ONLINE' | 'OFFLINE' | 'READY' | 'IN_GAME';

export interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: string;
}
