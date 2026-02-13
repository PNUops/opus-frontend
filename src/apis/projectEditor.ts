import { API_BASE_URL } from '@constants/index';
import apiClient from './apiClient';
import { ProjectDetailsEditDto, PreviewDeleteRequestDto, TeamMemberCreateRequestDto } from 'types/DTO/projectEditorDto';

export const patchProjectDetails = async (teamId: number, body: ProjectDetailsEditDto) => {
  const response = await apiClient.patch(`/teams/${teamId}`, body);
  return response.data;
};

export type ThumbnailResult =
  | { status: 'success'; url: string }
  | { status: 'processing'; code: 'THUMBNAIL_PROCESSING' }
  | { status: 'error'; code: 'THUMBNAIL_NOTFOUND' | 'THUMBNAIL_ERR_ETC' };

export const getThumbnail = async (teamId: number): Promise<ThumbnailResult> => {
  try {
    const response = await apiClient.get(`/teams/${teamId}/image/thumbnail`);

    if (response.status === 200) {
      return { status: 'success', url: `${API_BASE_URL}/api/teams/${teamId}/image/thumbnail` };
    } else if (response.status === 202) {
      return { status: 'processing', code: 'THUMBNAIL_PROCESSING' };
    } else {
      return { status: 'success', url: `${API_BASE_URL}/api/teams/${teamId}/image/thumbnail` };
    }
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { status: 'error', code: 'THUMBNAIL_NOTFOUND' };
    }

    return { status: 'error', code: 'THUMBNAIL_ERR_ETC' };
  }
};

export const postThumbnail = async (teamId: number, formData: FormData) => {
  const response = await apiClient.post(`/teams/${teamId}/image/thumbnail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deleteThumbnail = async (teamId: number) => {
  const response = await apiClient.delete(`/teams/${teamId}/image/thumbnail`);
  return response;
};

export const postPreview = async (teamId: number, formData: FormData) => {
  const response = await apiClient.post(`/teams/${teamId}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const deletePreview = async (teamId: number, body: PreviewDeleteRequestDto) => {
  const response = await apiClient.delete(`/teams/${teamId}/image`, { data: body });
  return response;
};

export const postMember = async (teamId: number, body: TeamMemberCreateRequestDto) => {
  const response = await apiClient.post(`/teams/${teamId}/members`, body);
  return response.data;
};

export const deleteMember = async (teamId: number, memberId: number) => {
  const response = await apiClient.delete(`/teams/${teamId}/members/${memberId}`);
  return response.data;
};

export const createProjectDetails = async (body: ProjectDetailsEditDto) => {
  const response = await apiClient.post('/teams', body);
  return response.data;
};
