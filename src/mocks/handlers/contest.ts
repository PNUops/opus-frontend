import { API_BASE_URL } from '@constants/env';
import { mockContestsResponse, mockProjectsAdminResponse } from '@mocks/data/contest';
import { mockTeams } from '@mocks/data/teams';
import { http, HttpResponse } from 'msw';

export const contestsHandler = [
  http.get(`${API_BASE_URL}/api/contests`, () => {
    return HttpResponse.json(mockContestsResponse);
  }),
  http.get(`${API_BASE_URL}/api/contests/:contestId/teams`, () => {
    return HttpResponse.json(mockTeams);
  }),
  http.get(`${API_BASE_URL}/api/admin/contests/:contestId/submissions`, () => {
    return HttpResponse.json(mockProjectsAdminResponse);
  }),
];
