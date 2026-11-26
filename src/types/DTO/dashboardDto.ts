export interface DashboardTeamResponseDto {
  teamId: number;
  teamName: string;
  projectName: string;
  isSubmitted: boolean;
}

export interface AdminRecentActivityDto {
  id: number;
  type: 'MEMBER_ROLES_CHANGED' | 'ADMIN_PERMISSION_GRANTED' | 'ADMIN_PERMISSION_REVOKED' | 'MEMBER_WITHDRAWN_BY_ADMIN';
  actorName: string;
  targetType: 'MEMBER';
  targetName: string;
  contestId: number | null;
  contestName: string | null;
  summary: string;
  createdAt: string;
}
