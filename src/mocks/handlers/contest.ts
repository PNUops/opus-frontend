import { API_BASE_URL } from '@constants/env';
import { mockContestBulkAddTeamsError, mockContestsResponse, mockProjectsAdminResponse } from '@mocks/data/contest';
import { mockTeams } from '@mocks/data/teams';
import { http, HttpResponse } from 'msw';

export const contestsHandler = [
  http.get(`${API_BASE_URL}/api/contests`, () => {
    return HttpResponse.json(mockContestsResponse);
  }),
  http.get(`${API_BASE_URL}/api/contests/:contestId/teams`, () => {
    return HttpResponse.json(mockTeams);
  }),
  // 대회 팀 설정 성공
  // http.post(`${API_BASE_URL}/api/contests/:contestId/teams/bulk`, () => {
  //   return HttpResponse.json(mockContestBulkAddTeamsResponse);
  // }),
  // 대회 팀 설정 오류
  http.post(`${API_BASE_URL}/api/contests/:contestId/teams/bulk`, () => {
    return HttpResponse.json(mockContestBulkAddTeamsError, { status: 400 });
  }),
  http.get(`${API_BASE_URL}/api/admin/contests/:contestId/submissions`, () => {
    return HttpResponse.json(mockProjectsAdminResponse);
  }),
];
