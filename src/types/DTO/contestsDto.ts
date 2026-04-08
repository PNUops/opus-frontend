import { AwardDto, TeamAwardDto, ContestAwardDto } from './awardsDto';

export interface ContestResponseDto {
  contestId: number;
  contestName: string;
  categoryId: number;
  categoryName: string;
  isCurrent: boolean;
  updatedAt: Date;
}

export interface GroupedContestResponseDto {
  categoryId: number;
  categoryName: string;
  contests: Pick<ContestResponseDto, 'contestId' | 'contestName' | 'isCurrent'>[];
}

export interface CurrentContestResponseDto {
  contestId: number;
  categoryName: string;
  contestName: string;
  voteStartAt: Date;
  voteEndAt: Date;
}

export interface ContestRequestDto {
  contestName: string;
  categoryId: number;
}

export interface ContestBulkAddTeamsResponseDto {
  teamCount: number;
  teams: {
    rowNumber: number;
    teamName: string;
    teamId: number;
  }[];
}

export interface ContestBulkAddTeamsErrorDto {
  rowNumber: number;
  message: string;
}

export interface VoteTermDto {
  voteStartAt: string;
  voteEndAt: string;
}

export type GetTeamAwardsResponseDto = TeamAwardDto[];

export type PatchAwardRequestDto = AwardDto;

export type TeamSortOption = 'RANDOM' | 'ASC' | 'CUSTOM';

export type TeamOrder = { teamId: number; itemOrder: number };

export interface TeamCustomSortData {
  teamId: number;
  itemOrder: number;
}

export interface ProjectsAdminResponseDto {
  teamId: number;
  teamName: string;
  projectName: string;
  trackName: string;
  isSubmitted: boolean;
}

export interface ContestTrackDto {
  trackId: number;
  trackName: string;
  updatedAt: string;
}

export type GetContestTracksResponseDto = ContestTrackDto[];

export interface PostContestTrackRequestDto {
  trackName: string;
}

export type GetContestAwardsResponseDto = ContestAwardDto[];

export type PatchContestAwardRequestDto = AwardDto;
