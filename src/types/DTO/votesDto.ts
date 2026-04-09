export interface VoteTermDto {
  voteStartAt: string;
  voteEndAt: string;
}

export interface VoteMaxVotesLimitDto {
  maxVotesLimit: number;
}

export interface MyContestVoteStatusDto {
  remainingVotesCount: number;
  maxVotesLimit: number;
}
