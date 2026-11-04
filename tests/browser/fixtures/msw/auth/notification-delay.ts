import { delay, http, HttpResponse } from 'msw';
import type { NotificationDto } from '../../../../../src/types/DTO/notificationDto';

const notifications: NotificationDto[] = [
  {
    id: 307,
    title: '제출 완료 알림',
    content: '기획서가 제출되었습니다.',
    targetType: 'SUBMISSION_COMPLETED',
    targetId: 1001,
    redirectUrl: '/me/contests/1/teams/101/submissions?submissionItemId=11',
    isRead: false,
    createdAt: '2026-11-02T12:00:00',
  },
];

const markAsRead = async () => {
  await delay(1000);
  notifications.forEach((notification) => {
    notification.isRead = true;
  });
  return new HttpResponse(null, { status: 204 });
};

export const handlers = [
  http.get('/api/notifications', () => HttpResponse.json(notifications)),
  http.patch('/api/notifications', markAsRead),
  http.patch('/api/notifications/:id', markAsRead),
];
