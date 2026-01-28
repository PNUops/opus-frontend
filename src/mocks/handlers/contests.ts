import { mockContestsResponse } from '@mocks/data/contests';
import { mockTeamsMain } from '@mocks/data/teams';
import { http, HttpResponse } from 'msw';

const base = import.meta.env.VITE_API_BASE_URL ?? '';

import { mockVoteStatistics, mockLikeRanking } from '@mocks/data/voteStats';

export const contestsHandler = [
  http.get(`${base}/api/contests`, () => {
    return HttpResponse.json(mockContestsResponse);
  }),
  http.get(`${base}/api/contests/:contestId/teams`, () => {
    return HttpResponse.json(mockTeamsMain);
  }),

  http.get(`${base}/api/admin/contests/:contestId/votes/statistics`, () => {
    return HttpResponse.json(mockVoteStatistics);
  }),

  http.get(`${base}/api/admin/contests/:contestId/ranking`, () => {
    return HttpResponse.json(mockLikeRanking);
  }),
];
  