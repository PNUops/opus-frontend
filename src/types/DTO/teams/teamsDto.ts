import { ContestAwardDto } from '@dto/awardsDto';
import { MemberType } from 'types/MemberType';

export interface TeamMemberDto {
  memberId: number;
  teamMemberName: string;
  roleType: MemberType;
}

export interface TeamBioDto {
  contestId: number;
  trackId: number | null;
  projectName: string;
  teamName: string | null;
  professorName: string | null;
  githubPath: string | null;
  youTubePath: string | null;
  productionPath: string | null;
  overview: string;
}

export interface TeamDetailDto {
  contestId: number;
  contestName: string;
  trackId: number | null;
  trackName: string | null;
  teamId: number;
  teamName: string | null;
  projectName: string | null;
  teamMembers: TeamMemberDto[];
  professorName: string | null;
  githubPath: string | null;
  youTubePath: string | null;
  productionPath: string | null;
  overview: string | null;
  previewIds: number[];
  isLiked: boolean;
  isVoted: boolean;
  awards: ContestAwardDto[];
}
