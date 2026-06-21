import { API_BASE_URL } from '@constants/env';
import { mockNotifications } from '@mocks/data/notifications';
import { http, HttpResponse } from 'msw';

let notifications = [...mockNotifications];

export const notificationsHandlers = [
  http.get(`${API_BASE_URL}/api/notifications`, () => {
    return HttpResponse.json(notifications);
  }),
  http.post(`${API_BASE_URL}/api/notifications/read-all`, () => {
    notifications = notifications.map((notification) => ({
      ...notification,
      isRead: true,
    }));

    return HttpResponse.json({ success: true });
  }),
  http.post(`${API_BASE_URL}/api/notifications/:notificationId/read`, ({ params }) => {
    const notificationId = Number(params.notificationId);

    notifications = notifications.map((notification) =>
      notification.id === notificationId ? { ...notification, isRead: true } : notification,
    );

    return HttpResponse.json({ success: true });
  }),
];
