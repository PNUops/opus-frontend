import { API_BASE_URL } from '../../constants/env';
import { mockTeamDetail } from '../data/teams';
import { http, HttpResponse } from 'msw';

const mockVoteResponse = { remainingVotesCount: 1, maxVotesLimit: 2 };

export const teamsHandlers = [
  http.get(`${API_BASE_URL}/api/teams/:teamId`, ({ params }) => {
    return HttpResponse.json({ ...mockTeamDetail, teamId: Number(params.teamId) });
  }),
  http.put(`${API_BASE_URL}/api/teams/:teamId/likes`, () => {
    return new HttpResponse(null, { status: 200 });
  }),
  http.delete(`${API_BASE_URL}/api/teams/:teamId/likes`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.put(`${API_BASE_URL}/api/teams/:teamId/votes`, () => {
    return HttpResponse.json(mockVoteResponse);
  }),
  http.delete(`${API_BASE_URL}/api/teams/:teamId/votes`, () => {
    return HttpResponse.json(mockVoteResponse);
  }),
];
