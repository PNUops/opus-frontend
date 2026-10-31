import { http, HttpResponse } from 'msw';
import type { GetNotificationsResponseDto } from '../../../../../src/types/DTO/notificationDto';

// The signed-in header needs this API; no existing notification MSW handler exists.
export const handlers = [
  http.get('/api/notifications', () => HttpResponse.json([] satisfies GetNotificationsResponseDto)),
];
