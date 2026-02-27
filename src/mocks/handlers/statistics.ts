import { http, HttpResponse } from 'msw';
import { mockVoteRanking, mockVoteStats, mockVoteLogs } from '@mocks/data/statistics';

const base = import.meta.env.VITE_API_BASE_URL ?? '';

export const statisticsHandlers = [
  http.get(`${base}/api/admin/contests/:contestId/ranking`, () => {
    return HttpResponse.json(mockVoteRanking);
  }),

  http.get(`${base}/api/admin/contests/:contestId/statistics`, () => {
    return HttpResponse.json(mockVoteStats);
  }),

  http.get(`${base}/api/admin/vote-log`, () => {
    return HttpResponse.json(mockVoteLogs);
  }),
];
