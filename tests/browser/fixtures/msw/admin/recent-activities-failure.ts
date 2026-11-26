import { http, HttpResponse } from 'msw';
let attempts = 0;
export const handlers = [
  http.get('/api/admin/dashboard/recent-activities', () =>
    ++attempts === 1 ? new HttpResponse(null, { status: 500 }) : HttpResponse.json([]),
  ),
];
