import { http, HttpResponse } from 'msw';
import { mockVoteRanking, mockVoteStats, mockVoteLogs, mockMainStats } from '@mocks/data/statistics';

const base = import.meta.env.VITE_API_BASE_URL ?? '';

export const statisticsHandlers = [
  http.get(`${base}/api/statistics/summary`, () => HttpResponse.json(mockMainStats)),

  http.get(`${base}/api/contests/:contestId/ranking`, () => {
    return HttpResponse.json(mockVoteRanking);
  }),

  http.get(`${base}/api/contests/:contestId/votes/statistics`, () => {
    return HttpResponse.json(mockVoteStats);
  }),

  http.get(`${base}/api/contests/:contestId/vote-log`, () => {
    return HttpResponse.json(mockVoteLogs);
  }),
];
