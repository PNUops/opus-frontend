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

export interface ContestRequestDto {
  contestName: string;
  categoryId: number;
}

export interface VoteTermDto {
  voteStartAt: string;
  voteEndAt: string;
}

export interface PatchAwardRequestDto {
  awardName: string | null;
  awardColor: string | null;
}

export type TeamOrder = { teamId: number; itemOrder: number };

export interface PatchCustomOrderRequestDto {
  contestId: number;
  teamOrders: TeamOrder[];
}
