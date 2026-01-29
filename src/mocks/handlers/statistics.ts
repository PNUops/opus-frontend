import { http, HttpResponse } from 'msw';
import { mockVoteStatistics, mockLikeRanking, mockParticipationRate } from '@mocks/data/voteStats';

const base = import.meta.env.VITE_API_BASE_URL ?? '';

export const participationRateHandlers = [
  http.get(`${base}/api/admin/participation-rate`, () => {
    return HttpResponse.json(mockParticipationRate);
  }),
];

export const voteStatisticsHandlers = [
  http.get(`${base}/api/admin/contests/:contestId/votes/statistics`, () => {
    return HttpResponse.json(mockVoteStatistics);
  }),
];

export const likeRankingHandlers = [
  http.get(`${base}/api/admin/contests/:contestId/ranking`, () => {
    return HttpResponse.json(mockLikeRanking);
  }),
];

import { mockVoteLogs } from '@mocks/data/voteStats';
export const voteLogHandlers = [
  http.get(`${base}/api/admin/vote-log`, () => {
    return HttpResponse.json(mockVoteLogs);
  }),
];
