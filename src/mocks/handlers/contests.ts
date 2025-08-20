import { API_BASE_URL } from '@constants/index';
import { mockContestsResponse } from '@mocks/data/contests';
import { mockTeamsMain } from '@mocks/data/teams';
import { http, HttpResponse } from 'msw';

export const contestsHandler = [
  http.get(`${API_BASE_URL}/api/contests`, () => {
    return HttpResponse.json(mockContestsResponse);
  }),
  http.get(`${API_BASE_URL}/api/contests/:contestId/teams`, () => {
    return HttpResponse.json(mockTeamsMain);
  }),
];
