import { API_BASE_URL } from '@constants/env';
import { mockMyProjects, mockMyLikes, mockMyLikesPreview, mockMyVotes } from '../data/me';
import { mockCommentsPagination } from '../data/comment';
import { http, HttpResponse } from 'msw';

export const meHandlers = [
  http.get(`${API_BASE_URL}/api/members/me/projects`, () => {
    return HttpResponse.json(mockMyProjects);
  }),
  http.get(`${API_BASE_URL}/api/members/me/likes/preview`, () => {
    return HttpResponse.json(mockMyLikesPreview);
  }),
  http.get(`${API_BASE_URL}/api/members/me/likes`, () => {
    return HttpResponse.json(mockMyLikes);
  }),
  http.get(`${API_BASE_URL}/api/members/me/votes`, () => {
    return HttpResponse.json(mockMyVotes);
  }),
  http.get(`${API_BASE_URL}/api/members/me/comments`, () => {
    return HttpResponse.json(mockCommentsPagination);
  }),
];
