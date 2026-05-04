import apiClient from './apiClient';
import {
  GetMyProjectsResponseDto,
  GetMyVotesResponseDto,
  GetMyLikesPreviewResponseDto,
  GetMyLikesParamsDto,
  GetMyCommentsParamsDto,
  GetMyLikesResponseDto,
} from '@dto/meDto';
import { GetCommentsPaginationResponseDto } from '@dto/commentDto';

export const getMyProjects = async (): Promise<GetMyProjectsResponseDto> => {
  const res = await apiClient.get('/members/me/projects');
  return res.data;
};

export const getMyVotes = async (): Promise<GetMyVotesResponseDto> => {
  const res = await apiClient.get('/members/me/votes');
  return res.data;
};

export const getMyLikesPreview = async (): Promise<GetMyLikesPreviewResponseDto> => {
  const res = await apiClient.get('/members/me/likes/preview');
  return res.data;
};

export const getMyLikes = async (params?: GetMyLikesParamsDto): Promise<GetMyLikesResponseDto> => {
  const res = await apiClient.get('/members/me/likes', { params: params });
  return res.data;
};

export const getMyComments = async (params?: GetMyCommentsParamsDto): Promise<GetCommentsPaginationResponseDto> => {
  const res = await apiClient.get('/members/me/comments', { params: params });
  return res.data;
};

export const deleteMyProfileImage = async () => {
  const res = await apiClient.delete('/members/me/images/profile');
  return res.data;
};

export const patchMyProfileImage = async (formData: FormData) => {
  const res = await apiClient.patch('/members/me/images/profile', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getMyProfileImage = async (): Promise<Blob | null> => {
  try {
    const res = await apiClient.get('/members/me/images/profile', {
      responseType: 'blob',
    });

    return res.data;
  } catch {
    return null;
  }
};

export const patchMyGithubUrl = async (githubUrl: string) => {
  const res = await apiClient.patch('/members/me/github-url', { githubUrl });
  return res.data;
};
