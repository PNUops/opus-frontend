import apiClient from './apiClient';
import type { GetMySubmissionListResponseDto } from '@dto/meDto';
import type {
  GetSubmissionItemsResponseDto,
  SubmissionDetailResponseDto,
  SubmissionItemRequestDto,
  SubmissionItemSettingResponseDto,
  SubmitSubmissionResponseDto,
} from '@dto/submissionDto';

/** 제출 항목 목록 조회 (어드민 제출 항목 설정 탭) */
export const getSubmissionItems = async (contestId: number) => {
  const res = await apiClient.get<GetSubmissionItemsResponseDto>(`/contests/${contestId}/submission-items`);
  return res.data;
};

/** 제출 항목 추가 */
export const postSubmissionItem = async (contestId: number, body: SubmissionItemRequestDto) => {
  const res = await apiClient.post(`/contests/${contestId}/submission-items`, body);
  return res.data;
};

/** 제출 항목 설정값(상세) 조회 */
export const getSubmissionItemSetting = async (contestId: number, submissionItemId: number) => {
  const res = await apiClient.get<SubmissionItemSettingResponseDto>(
    `/contests/${contestId}/submission-items/${submissionItemId}`,
  );
  return res.data;
};

/** 제출 항목 수정 */
export const patchSubmissionItem = async (
  contestId: number,
  submissionItemId: number,
  body: SubmissionItemRequestDto,
) => {
  const res = await apiClient.patch(`/contests/${contestId}/submission-items/${submissionItemId}`, body);
  return res.data;
};

/** 제출 항목 삭제 */
export const deleteSubmissionItem = async (contestId: number, submissionItemId: number) => {
  const res = await apiClient.delete(`/contests/${contestId}/submission-items/${submissionItemId}`);
  return res.data;
};

/** 내 프로젝트 - 팀 제출물 목록 조회 (teamId는 쿼리 파라미터) */
export const getMySubmissions = async (contestId: number, teamId: number) => {
  const res = await apiClient.get<GetMySubmissionListResponseDto>(`/contests/${contestId}/submissions`, {
    params: { teamId },
  });
  return res.data;
};

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
