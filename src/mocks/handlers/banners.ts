import { API_BASE_URL } from '@constants/index';
import { http, HttpResponse } from 'msw';

export const bannersHandler = [
  http.post(`${API_BASE_URL}/api/contests/:contestId/image/banner`, (req) => {
    return HttpResponse.json({}, { status: 201 });
  }),

  http.head(`${API_BASE_URL}/api/contests/:contestId/image/banner`, ({ params }) => {
    if (params.contestId === '1') {
      return HttpResponse.json({}, { status: 200 });
    }
    return HttpResponse.json({}, { status: 404 });
  }),

  http.get(`${API_BASE_URL}/api/contests/:contestId/image/banner`, ({ params }) => {
    if (params.contestId === '1') {
      const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="20">Mock Banner</text></svg>`;
      return new HttpResponse(svg, { status: 200, headers: { 'Content-Type': 'image/svg+xml' } });
    }
    return HttpResponse.json({}, { status: 404 });
  }),

  http.delete(`${API_BASE_URL}/api/contests/:contestId/image/banner`, ({ params }) => {
    if (params.contestId === '1') {
      return HttpResponse.json({}, { status: 204 });
    }
    return HttpResponse.json({}, { status: 404 });
  }),
];
