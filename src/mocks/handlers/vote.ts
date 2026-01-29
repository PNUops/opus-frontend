import { http, HttpResponse } from 'msw';
import { mockVoteApiStatistics } from '@mocks/data/voteStats';

const base = import.meta.env.VITE_API_BASE_URL ?? '';

export const voteHandlers = [
  http.get(`${base}/api/vote/statistics`, () => {
    return HttpResponse.json(mockVoteApiStatistics);
  }),
];