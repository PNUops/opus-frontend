import { http, HttpResponse } from 'msw';
import { mockVoteStatistics, mockLikeRanking, mockVoteLogs } from '@mocks/data/statistics';

const base = import.meta.env.VITE_API_BASE_URL ?? '';

export const statisticsHandlers = [
  http.get(`${base}/api/admin/contests/:contestId/votes/statistics`, () => {
    return HttpResponse.json(mockVoteStatistics);
  }),

  http.get(`${base}/api/admin/contests/:contestId/ranking`, () => {
    return HttpResponse.json(mockLikeRanking);
  }),

  http.get(`${base}/api/admin/vote-log`, () => {
    return HttpResponse.json(mockVoteLogs);
  }),
];
