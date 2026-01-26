import { AwardDto, TeamAwardDto, ContestAwardDto } from './awardsDto';

export interface ContestResponseDto {
  contestId: number;
  contestName: string;
  categoryId: number;
  categoryName: string;
  isCurrent: boolean;
  updatedAt: Date;
}
export interface CurrentContestResponseDto {
  contestId: number;
  categoryName: string;
  contestName: string;
  voteStartAt: Date;
  voteEndAt: Date;
}

export interface VoteTermDto {
  voteStartAt: string;
  voteEndAt: string;
}

export type GetTeamAwardsResponseDto = TeamAwardDto[];

export type PatchAwardRequestDto = AwardDto;

export type TeamOrder = { teamId: number; itemOrder: number };

export interface PatchCustomOrderRequestDto {
  contestId: number;
  teamOrders: TeamOrder[];
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
