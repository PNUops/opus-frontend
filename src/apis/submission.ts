import apiClient from './apiClient';
import type { SubmissionDetailResponseDto, SubmitSubmissionResponseDto } from '@dto/submissionDto';

/** 제출물 상세 조회 */
export const getSubmissionDetail = async (contestId: number, submissionId: number) => {
  const res = await apiClient.get<SubmissionDetailResponseDto>(`/contests/${contestId}/submissions/${submissionId}`);
  return res.data;
};

/** 제출물 제출 (특정 제출 항목에 파일 제출) — 응답으로 생성된 submissionId 반환 */
export const postSubmission = async (contestId: number, submissionItemId: number, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const res = await apiClient.post<SubmitSubmissionResponseDto>(
    `/contests/${contestId}/submission-items/${submissionItemId}/submissions`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return res.data;
};

/** 이미 제출된 제출물에 파일 추가 */
export const postSubmissionFiles = async (contestId: number, submissionId: number, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const res = await apiClient.post(`/contests/${contestId}/submissions/${submissionId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

/** 제출된 제출물의 파일 삭제 */
export const deleteSubmissionFile = async (contestId: number, submissionId: number, fileId: number) => {
  const res = await apiClient.delete(`/contests/${contestId}/submissions/${submissionId}/files/${fileId}`);
  return res.data;
};
