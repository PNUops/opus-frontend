export interface VoteReportRankingDto {
  rank: number;
  teamId: number;
  teamName: string | null;
  projectName: string | null;
  trackName: string | null;
  voteCount: number;
}

export interface VoteReportDto {
  contestName: string;
  voteStartAt: string;
  voteEndAt: string;
  isVoteEnded: boolean;
  aggregatedAt: string;
  maxVotesLimit: number;
  totalVoters: number;
  totalVotes: number;
  averageVotesPerVoter: number;
  teamCount: number;
  averageVotesPerTeam: number;
  zeroVoteTeamCount: number;
  dailyVotes: { date: string; voterCount: number; voteCount: number }[];
  voteUsages: { usedVotes: number; voterCount: number; ratio: number }[];
  hourlyVotes: { hour: string; voteCount: number; cumulativeVoterCount: number }[];
  voterRoles: { role: string | null; voterCount: number; ratio: number }[];
  admissionYears: { admissionYear: number | null; voterCount: number; ratio: number }[];
  trackVotes: { trackName: string | null; teamCount: number; voteCount: number; averageVotesPerTeam: number }[];
  trackTopRankings: { trackName: string | null; rankings: VoteReportRankingDto[] }[];
  rankings: VoteReportRankingDto[];
}
