import { API_BASE_URL } from '@constants/index';
import { mockNoticeDetail, mockNotices } from '@mocks/data/notices';
import { http, HttpResponse } from 'msw';

export const noticesHandler = [
  http.get(`${API_BASE_URL}/api/notices`, () => {
    return HttpResponse.json(mockNotices);
  }),
  http.get(`${API_BASE_URL}/api/notices/:noticeId`, () => {
    return HttpResponse.json(mockNoticeDetail);
  }),
];
