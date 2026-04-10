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

type ProfileResult =
  | { id?: number; status: 'success'; url: string }
  | { status: 'processing'; code: 'PROCESSING' }
  | { status: 'error'; code: 'NOTFOUND' | 'ERR_ETC' };

export const getMyProfileImage = async (): Promise<ProfileResult> => {
  try {
    const res = await apiClient.get('/members/me/images/profile', {
      responseType: 'blob',
      validateStatus: (status) => [200, 202, 404].includes(status),
    });

    if (res.status === 200) {
      const blobUrl = URL.createObjectURL(res.data);
      return {
        status: 'success',
        url: blobUrl,
      };
    }

    if (res.status === 202) {
      return {
        status: 'processing',
        code: 'PROCESSING',
      };
    }

    return {
      status: 'error',
      code: 'NOTFOUND',
    };
  } catch {
    return { status: 'error', code: 'ERR_ETC' };
  }
};

export const patchMyGithubUrl = async (githubPath: string) => {
  const res = await apiClient.patch('/members/me/github-path', { githubPath });
  return res.data;
};
