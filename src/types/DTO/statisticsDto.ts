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

export interface VoteLogItemDto {
  teamName: string;
  voterName: string;
  voterEmail: string;
  votedAt: string;
}
