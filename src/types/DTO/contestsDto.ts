export interface ContestResponseDto {
  contestId: number;
  contestName: string;
  updatedAt: Date;
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
