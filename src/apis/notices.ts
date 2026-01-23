import apiClient from './apiClient';
import { NoticeResponseDto } from 'types/DTO/notices/NoticeResponseDto';
import { NoticeDetailDto } from '../types/DTO/notices/NoticeDetailDto';
import { NoticeRequestDto } from 'types/DTO/notices/NoticeRequestDto';

export const getNotices = async (): Promise<NoticeResponseDto[]> => {
  const { data } = await apiClient.get('/notices');
  return data.map((notice: NoticeResponseDto) => ({
    ...notice,
    createdAt: new Date(notice.createdAt),
  }));
};

export const getNoticeDetail = async (noticeId: number): Promise<NoticeDetailDto> => {
  const { data } = await apiClient.get(`/notices/${noticeId}`);
  return { ...data, updatedAt: new Date(data.updatedAt), createdAt: new Date(data.createdAt) };
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

export const getContestNotices = async (contestId: number): Promise<NoticeResponseDto[]> => {
  const res = await apiClient.get(`/contests/${contestId}/notices`);
  return res.data;
};

export const createContestNotice = async (contestId: number, payload: NoticeRequestDto) => {
  const res = await apiClient.post(`/contests/${contestId}/notices`, payload);
  return res.data;
};

export const updateContestNotice = async (contestId: number, noticeId: number, payload: NoticeRequestDto) => {
  const res = await apiClient.patch(`/contests/${contestId}/notices/${noticeId}`, payload);
  return res.data;
};

export const deleteContestNotice = async (contestId: number, noticeId: number) => {
  const res = await apiClient.delete(`/contests/${contestId}/notices/${noticeId}`);
  return res.data;
};
