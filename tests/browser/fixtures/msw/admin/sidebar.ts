import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/categories', () => HttpResponse.json([])),
  http.get('/api/notifications', () => HttpResponse.json([])),
  http.get('/api/contests/:contestId/team-detail-submissions', () => HttpResponse.json([])),
];
