import apiClient from '@apis/apiClient';
import type { GetNotificationsResponseDto } from '@dto/notificationDto';

export const getNotifications = async (): Promise<GetNotificationsResponseDto> => {
  const res = await apiClient.get<GetNotificationsResponseDto>('/notifications');
  return res.data;
};

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  await apiClient.patch(`/notifications/${notificationId}`);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications');
};
