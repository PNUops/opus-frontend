import apiClient from './apiClient';
import {
  GetMyProjectsResponseDto,
  GetMyVotesResponseDto,
  GetMyLikesPreviewResponseDto,
  GetMyLikesResponseDto,
} from 'types/DTO/meDto';
import { GetCommentsPaginationResponseDto } from 'types/DTO/commentDto';

export const getMyProjects = async (): Promise<GetMyProjectsResponseDto> => {
  const res = await apiClient.get('/members/me/projects');
  return res.data;
};

export const getMyVotes = async (): Promise<GetMyVotesResponseDto> => {
  const res = await apiClient.get('/members/me/votes');
  return res.data;
};

export const getMyLikesPreview = async (): Promise<GetMyLikesResponseDto> => {
  const res = await apiClient.get('/members/me/likes/preview');
  return res.data;
};

export const getMyLikes = async (): Promise<GetMyLikesPreviewResponseDto> => {
  const res = await apiClient.get('/members/me/likes');
  return res.data;
};

export const getMyComments = async (): Promise<GetCommentsPaginationResponseDto> => {
  const res = await apiClient.get('/members/me/comments');
  return res.data;
};
