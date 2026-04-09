import { TeamMemberDto } from '@dto/teams/teamsDto';

const isTeamMember = (memberId: number, teamMembers: TeamMemberDto[]): boolean => {
  return teamMembers.some((member) => member.memberId === memberId);
};

export const canEditTeamPage = (memberId: number, teamMembers: TeamMemberDto[], isAdmin = false): boolean => {
  if (isAdmin) return true;
  return isTeamMember(memberId, teamMembers);
};
