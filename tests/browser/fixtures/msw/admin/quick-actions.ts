import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/categories', () => HttpResponse.json([])),
  http.get('/api/notifications', () => HttpResponse.json([])),
  http.get('/api/contests/:contestId/tracks', () => HttpResponse.json([])),
  http.get('/api/contests/:contestId/submission-items', () => HttpResponse.json([])),
  http.post('/api/contests/:contestId/teams/bulk', ({ params }) =>
    params.contestId === '2'
      ? HttpResponse.json({ errors: [{ rowNumber: 5, message: '팀 이름은 필수입니다.' }] }, { status: 400 })
      : HttpResponse.json({ teamCount: 1, teams: [] }),
  ),
  http.post('/api/contests/:contestId/submission-items', ({ params }) =>
    params.contestId === '2'
      ? HttpResponse.json({ message: '저장 실패' }, { status: 500 })
      : HttpResponse.json({}, { status: 201 }),
  ),
  http.get('/api/contests/:contestId/notices', () => HttpResponse.json([])),
];
