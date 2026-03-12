import { AwardDto } from './awardsDto';

export interface MyProjectDto {
  contestId: number;
  contestName: string;
  teamId: number;
  teamName: string;
  projectName: string;
  thumbnailUrl: string | null;
  awards: AwardDto[];
}

interface MyVoteDto {
  contestId: number;
  contestName: string;
  teamId: number;
  teamName: string;
  projectName: string;
  thumbnailUrl: string | null;
}

interface MyLikeDto {
  teamId: number;
  teamName: string;
  contestId: number;
  projectName: string;
  thumbnailUrl: string | null;
  contestName: string;
}

export type GetMyProjectsResponseDto = MyProjectDto[];

export type GetMyVotesResponseDto = MyVoteDto[];

export type GetMyLikesResponseDto = MyLikeDto[];
