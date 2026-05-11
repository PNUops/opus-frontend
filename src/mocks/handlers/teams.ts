import { mockTeamDetail } from '@mocks/data/teams';
import { API_BASE_URL } from '@constants/env';
import { http, HttpResponse } from 'msw';

export const teamsHandlers = [
  http.get(`${API_BASE_URL}/api/teams/:teamId`, () => {
    return HttpResponse.json(mockTeamDetail);
  }),
];
