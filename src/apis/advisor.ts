import axios, { type AxiosResponse } from 'axios';

import type {
  AdvisorFeedbackDto,
  GetAdvisorContestsResponseDto,
  GetAdvisorProjectsResponseDto,
  GetAdvisorTeamSubmissionsResponseDto,
  PutAdvisorFeedbackRequestDto,
} from '@dto/advisorDto';

import apiClient from './apiClient';

const createAdvisorFeedbackFormData = ({
  description,
  files = [],
  removeFileIds = [],
}: PutAdvisorFeedbackRequestDto) => {
  const formData = new FormData();
  formData.append('description', description);
  files.forEach((file) => formData.append('files', file));
  removeFileIds.forEach((fileId) => formData.append('removeFileIds', String(fileId)));
  return formData;
};

export const getAdvisorContests = async (): Promise<GetAdvisorContestsResponseDto> => {
  const res = await apiClient.get<GetAdvisorContestsResponseDto>('/mentors/me/contests');
  return res.data;
};

export const getAdvisorProjects = async (contestId: number): Promise<GetAdvisorProjectsResponseDto> => {
  const res = await apiClient.get<GetAdvisorProjectsResponseDto>(`/mentors/me/contests/${contestId}/teams`);
  return res.data;
};

export const getAdvisorTeamSubmissions = async (
  contestId: number,
  teamId: number,
): Promise<GetAdvisorTeamSubmissionsResponseDto> => {
  const res = await apiClient.get<GetAdvisorTeamSubmissionsResponseDto>(
    `/mentors/me/contests/${contestId}/teams/${teamId}/submissions `,
  );
  return res.data;
};

export const getMyAdvisorFeedback = async (
  contestId: number,
  submissionId: number,
): Promise<AdvisorFeedbackDto | null> => {
  try {
    const res = await apiClient.get<AdvisorFeedbackDto>(
      `/contests/${contestId}/submissions/${submissionId}/feedbacks/me`,
    );
    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

export const putAdvisorFeedback = async (
  contestId: number,
  submissionId: number,
  payload: PutAdvisorFeedbackRequestDto,
) => {
  const res = await apiClient.put(
    `/contests/${contestId}/submissions/${submissionId}/feedbacks`,
    createAdvisorFeedbackFormData(payload),
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return res.data;
};

export const getAdvisorSubmissionFile = async (
  contestId: number,
  submissionId: number,
  fileId: number,
): Promise<AxiosResponse<Blob>> => {
  return apiClient.get<Blob>(`/contests/${contestId}/submissions/${submissionId}/files/${fileId}`, {
    responseType: 'blob',
  });
};

export const getAdvisorFeedbackFile = async (
  contestId: number,
  submissionId: number,
  feedbackId: number,
  fileId: number,
): Promise<AxiosResponse<Blob>> => {
  return apiClient.get<Blob>(
    `/contests/${contestId}/submissions/${submissionId}/feedbacks/${feedbackId}/files/${fileId}`,
    {
      responseType: 'blob',
    },
  );
};
