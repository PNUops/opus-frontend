export interface VoteRankingDto {
  rank: number;
  teamName: string;
  projectName: string;
  trackName: string;
  voteCount: number;
}

export interface VoteStatsDto {
  totalVotes: number;
  totalVoters: number;
  averageVotesPerVoter: number;
}

// 추후 수정 필요할 수 있음
export interface VoteLogItemDto {
  votedAt: string;
  teamId?: number;
  teamName: string;
  voterName: string;
  voterEmail?: string;
}
