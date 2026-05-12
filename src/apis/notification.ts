import apiClient from '@apis/apiClient';

interface Notification {
  id: number;
  title: string;
  content: string;
  targetType: 'TEAM' | 'TEAM_COMMENT' | 'TEAM_AWARD';
  targetId: number;
  redirectUrl: string;
  isRead: boolean;
  createdAt: string;
}

export const getNotifications = async (): Promise<Notification[]> => {
  const res = await apiClient.get('/notifications');
  return res.data;
};

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  await apiClient.post(`/notifications/${notificationId}/read`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.post('/notifications/read-all');
};
