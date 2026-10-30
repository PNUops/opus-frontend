import dayjs from 'dayjs';

export const formatNotificationCreatedAt = (value: string) => {
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY.MM.DD HH:mm') : '-';
};
