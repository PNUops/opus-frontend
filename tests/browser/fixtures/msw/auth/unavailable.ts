import { http, HttpResponse } from 'msw';

export const handlers = [http.post('/api/sign-in', () => new HttpResponse(null, { status: 503 }))];
