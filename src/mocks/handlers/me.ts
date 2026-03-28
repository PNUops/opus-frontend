import { API_BASE_URL } from '@constants/env';
import { mockMyProjects, getMockMyLikes, mockMyLikesPreview, mockMyVotes } from '../data/me';
import { getMockMyComments } from '../data/comment';
import { http, HttpResponse } from 'msw';

export const meHandlers = [
  http.get(`${API_BASE_URL}/api/members/me/projects`, () => {
    return HttpResponse.json(mockMyProjects);
  }),
  http.get(`${API_BASE_URL}/api/members/me/likes/preview`, () => {
    return HttpResponse.json(mockMyLikesPreview);
  }),
  http.get(`${API_BASE_URL}/api/members/me/likes`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 0;
    const size = Number(url.searchParams.get('size')) || 6;
    return HttpResponse.json(getMockMyLikes(page, size));
  }),
  http.get(`${API_BASE_URL}/api/members/me/votes`, () => {
    return HttpResponse.json(mockMyVotes);
  }),
  http.get(`${API_BASE_URL}/api/members/me/comments`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 0;
    const size = Number(url.searchParams.get('size')) || 10;
    return HttpResponse.json(getMockMyComments(page, size));
  }),
];
