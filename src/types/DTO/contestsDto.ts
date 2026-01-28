export interface ContestResponseDto {
  contestId: number;
  contestName: string;
  updatedAt: Date;
}

export interface VoteTermDto {
  voteStartAt: string;
  voteEndAt: string;
}

export interface VoteStatisticsDto {
  totalVotes: number;
  totalVoters: number;
  averageVotesPerVoter: number;
}

export interface RankingDto {
  rank: number;
  teamId: number;
  teamName: string;
  projectName: string;
  trackName: string;
  likeCount: number;
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
