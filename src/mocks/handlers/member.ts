import { API_BASE_URL } from '@constants/env';
import { http, HttpResponse } from 'msw';
import { mockMemberAccount } from '../data/member';

export const memberHandlers = [
  http.get(`${API_BASE_URL}/api/members/me`, () => {
    return HttpResponse.json(mockMemberAccount);
  }),
];
