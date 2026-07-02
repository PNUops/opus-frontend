import axios from 'axios';

import apiClient from './apiClient';
import type {
  ConfirmMemoResponseDto,
  GetMySubmissionListResponseDto,
  GetMySubmissionSummaryResponseDto,
  GetMySubmissionTimelineResponseDto,
} from '@dto/meDto';
import type {
  GetSubmissionArchivesResponseDto,
  GetSubmissionFeedbacksResponseDto,
  GetSubmissionItemsResponseDto,
  GetSubmissionStatusesResponseDto,
  SubmissionDetailResponseDto,
  SubmissionDownloadTargetDto,
  SubmissionItemRequestDto,
  SubmissionItemSettingResponseDto,
  SubmitSubmissionResponseDto,
} from '@dto/submissionDto';

/** 제출 현황 목록 조회 (어드민) — 페이지네이션·필터는 클라이언트에서 처리 */
export const getSubmissionStatuses = async (contestId: number) => {
  const res = await apiClient.get<GetSubmissionStatusesResponseDto>(`/admin/contests/${contestId}/submissions`);
  return res.data;
};

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

/** 내 프로젝트 - 제출물 상태 요약 조회 */
export const getMySubmissionSummary = async (contestId: number, teamId: number) => {
  const res = await apiClient.get<GetMySubmissionSummaryResponseDto>(
    `/contests/${contestId}/teams/${teamId}/submissions/summary`,
  );
  return res.data;
};

/** 내 프로젝트 - 제출 타임라인 조회 */
export const getMySubmissionTimeline = async (contestId: number, teamId: number) => {
  const res = await apiClient.get<GetMySubmissionTimelineResponseDto>(
    `/contests/${contestId}/teams/${teamId}/submissions/timeline`,
  );
  return res.data;
};

/** 제출물 상세 조회 */
export const getSubmissionDetail = async (contestId: number, submissionId: number) => {
  const res = await apiClient.get<SubmissionDetailResponseDto>(`/contests/${contestId}/submissions/${submissionId}`);
  return res.data;
};

/** 피드백 목록 조회 (어드민 피드백 Drawer / 멤버 제출물 자세히보기 공용) */
export const getSubmissionFeedbacks = async (contestId: number, submissionId: number) => {
  const res = await apiClient.get<GetSubmissionFeedbacksResponseDto>(
    `/contests/${contestId}/submissions/${submissionId}/feedbacks`,
  );
  return res.data;
};

/** 제출물 제출 (특정 제출 항목에 파일 제출) — 응답으로 생성된 submissionId 반환 */
export const postSubmission = async (contestId: number, submissionItemId: number, teamId: number, files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const res = await apiClient.post<SubmitSubmissionResponseDto>(
    `/contests/${contestId}/submission-items/${submissionItemId}/submissions`,
    formData,
    {
      params: { teamId },
      headers: { 'Content-Type': 'multipart/form-data' },
    },
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

/** 확인 메모 조회 (멤버 제출물 자세히보기) — 메모 없으면 404 → null로 변환 */
export const getConfirmMemo = async (contestId: number, teamId: number, submissionId: number) => {
  try {
    const res = await apiClient.get<ConfirmMemoResponseDto | null>(
      `/contests/${contestId}/teams/${teamId}/submissions/${submissionId}/memos`,
    );
    return res.data;
  } catch (error) {
    // 메모가 없으면 서버가 404를 반환 — 정상 상태이므로 null로 처리
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/** 확인 메모 생성 */
export const postConfirmMemo = async (contestId: number, teamId: number, submissionId: number, content: string) => {
  const res = await apiClient.post(`/contests/${contestId}/teams/${teamId}/submissions/${submissionId}/memos`, {
    content,
  });
  return res.data;
};

/** 확인 메모 수정 */
export const patchConfirmMemo = async (contestId: number, teamId: number, submissionId: number, content: string) => {
  const res = await apiClient.patch(`/contests/${contestId}/teams/${teamId}/submissions/${submissionId}/memos`, {
    content,
  });
  return res.data;
};

/** 확인 메모 삭제 */
export const deleteConfirmMemo = async (contestId: number, teamId: number, submissionId: number) => {
  const res = await apiClient.delete(`/contests/${contestId}/teams/${teamId}/submissions/${submissionId}/memos`);
  return res.data;
};

/** 제출 파일 다운로드 목록 조회 (제출 항목 종류 x 분과) */
export const getSubmissionDownloads = async (contestId: number) => {
  const res = await apiClient.get<GetSubmissionArchivesResponseDto>(`/contests/${contestId}/submissions/downloads`);
  return res.data;
};

/** 분과별 제출 파일 일괄 다운로드 (zip blob) — Content-Disposition 파일명을 위해 응답 전체 반환 */
export const postSubmissionDownloads = (contestId: number, targets: SubmissionDownloadTargetDto[]) =>
  apiClient.post<Blob>(`/contests/${contestId}/submissions/downloads`, { targets }, { responseType: 'blob' });

/** 제출 파일 단건 다운로드 (blob) — Content-Disposition 파일명을 위해 응답 전체 반환 */
export const getSubmissionFileDownload = (contestId: number, submissionId: number, fileId: number) =>
  apiClient.get<Blob>(`/contests/${contestId}/submissions/${submissionId}/files/${fileId}`, { responseType: 'blob' });

/** 제출 파일 일괄 다운로드 (zip blob) — Content-Disposition 파일명을 위해 응답 전체 반환 */
export const getSubmissionFilesDownload = (contestId: number, submissionId: number) =>
  apiClient.get<Blob>(`/contests/${contestId}/submissions/${submissionId}/files`, { responseType: 'blob' });

/** 피드백 첨부파일 단건 다운로드 (blob) — Content-Disposition 파일명을 위해 응답 전체 반환 */
export const getFeedbackFileDownload = (contestId: number, submissionId: number, feedbackId: number, fileId: number) =>
  apiClient.get<Blob>(`/contests/${contestId}/submissions/${submissionId}/feedbacks/${feedbackId}/files/${fileId}`, {
    responseType: 'blob',
  });
