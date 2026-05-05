import { API_BASE_URL } from '@constants/env';
import axios from 'axios';
import apiClient from './apiClient';
import {
  PreviewImagesResponseDto,
  CommentCreateRequestDto,
  CommentDeleteRequestDto,
  CommentEditRequestDto,
  CommentDto,
  PreviewResult,
  TeamVoteResponseDto,
} from '@dto/projectViewerDto';
import { TeamDetailDto } from '@dto/teams/teamsDto';

export const getTeamDetail = async (teamId: number): Promise<TeamDetailDto> => {
  try {
    const res = await apiClient.get(`/teams/${teamId}`);
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && [401].includes(error.response?.status ?? 0)) {
      return getTeamDetailPublic(teamId);
    }
    throw error;
  }
};

export const getTeamDetailPublic = async (teamId: number): Promise<TeamDetailDto> => {
  const res = await apiClient.get(`/teams/${teamId}/public`);
  return res.data;
};

export const getPreviewImages = async (teamId: number, imageIds: number[]): Promise<PreviewImagesResponseDto> => {
  const imageResults: PreviewResult[] = [];

  for (const imageId of imageIds) {
    try {
      const response = await apiClient.get(`/teams/${teamId}/image/${imageId}`);

      if (response.status === 200) {
        imageResults.push({
          id: imageId,
          status: 'success',
          url: `${API_BASE_URL}/api/teams/${teamId}/image/${imageId}`,
        });
      } else if (response.status === 202) {
        imageResults.push({ status: 'processing', code: 'PREVIEW_PROCESSING' });
      } else {
        imageResults.push({
          id: imageId,
          status: 'success',
          url: `${API_BASE_URL}/api/teams/${teamId}/image/${imageId}`,
        });
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        imageResults.push({ status: 'error', code: 'PREVIEW_NOTFOUND' });
      } else {
        imageResults.push({ status: 'error', code: 'PREVIEW_ERR_ETC' });
      }
    }
  }

  return { imageResults };
};

export const addLike = async (teamId: number): Promise<void> => {
  await apiClient.put(`/teams/${teamId}/likes`);
};

export const removeLike = async (teamId: number): Promise<void> => {
  await apiClient.delete(`/teams/${teamId}/likes`);
};

export const addVote = async (teamId: number): Promise<TeamVoteResponseDto> => {
  const response = await apiClient.put(`/teams/${teamId}/votes`);
  return response.data;
};

export const removeVote = async (teamId: number): Promise<TeamVoteResponseDto> => {
  const response = await apiClient.delete(`/teams/${teamId}/votes`);
  return response.data;
};

export const postCommentForm = async ({ teamId, description }: CommentCreateRequestDto) => {
  const response = await apiClient.post(`/teams/${teamId}/comments`, { description });
  return response.data;
};

export const deleteComment = async ({ teamId, commentId }: CommentDeleteRequestDto) => {
  await apiClient.delete(`teams/${teamId}/comments/${commentId}`);
};

export const editComment = async ({ teamId, commentId, description }: CommentEditRequestDto) => {
  const response = await apiClient.patch(`teams/${teamId}/comments/${commentId}`, { description });
  return response.data;
};

export const getCommentsList = async (teamId: number): Promise<CommentDto[]> => {
  const response = await apiClient.get(`/teams/${teamId}/comments`);
  return response.data;
};
