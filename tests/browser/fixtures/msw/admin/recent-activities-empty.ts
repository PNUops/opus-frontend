import { http, HttpResponse } from 'msw';
export const handlers = [http.get('/api/admin/dashboard/recent-activities', () => HttpResponse.json([]))];
