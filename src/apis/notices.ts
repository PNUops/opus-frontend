import { NoticeDetailDto, NoticeListDto, NoticeRequestDto } from 'types/DTO/noticeDto';
import apiClient from './apiClient';

export const getNotices = async (): Promise<NoticeListDto[]> => {
  const { data } = await apiClient.get('/notices');
  return data;
};

export const getNoticeDetail = async (noticeId: number): Promise<NoticeDetailDto> => {
  const { data } = await apiClient.get(`/notices/${noticeId}`);
  return data;
};

export const postCreateNotice = async (request: NoticeRequestDto) => {
  const { data } = await apiClient.post('/notices', request);
  return data;
};

export const patchNotice = async (noticeId: number, request: NoticeRequestDto) => {
  const { data } = await apiClient.patch(`/notices/${noticeId}`, request);
  return data;
};

export const deleteNotice = async (noticeId: number) => {
  const { data } = await apiClient.delete(`/notices/${noticeId}`);
  return data;
};
