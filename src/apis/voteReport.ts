import axios from 'axios';
import apiClient from './apiClient';
import type { VoteReportDto } from '@dto/voteReportDto';

export const getVoteReport = async (contestId: number, signal?: AbortSignal): Promise<VoteReportDto> => {
  const { data } = await apiClient.get<VoteReportDto>(`/contests/${contestId}/votes/report`, { signal });
  return data;
};

export const getVoteReportPdf = async (contestId: number, signal?: AbortSignal) => {
  const response = await apiClient.get<Blob>(`/contests/${contestId}/votes/report/download`, {
    responseType: 'blob',
    headers: { Accept: 'application/pdf' },
    signal,
  });
  // 잘못된 성공 응답(JSON/HTML)을 미리보기 문서로 열지 않습니다.
  if (!(response.data instanceof Blob) || (await response.data.slice(0, 5).text()) !== '%PDF-') {
    throw new Error('PDF 파일을 받지 못했어요. 다시 시도해 주세요.');
  }
  return { ...response, data: new Blob([response.data], { type: 'application/pdf' }) };
};

/** responseType=blob인 실패 응답도 읽되 요청 정보나 인증 헤더를 로그에 남기지 않습니다. */
export const getVoteReportErrorMessage = async (error: unknown, fallback: string): Promise<string> => {
  if (axios.isAxiosError(error)) {
    let body: unknown = error.response?.data;
    if (body instanceof Blob) {
      try {
        body = JSON.parse(await body.text());
      } catch {
        return fallback;
      }
    }
    if (typeof body === 'object' && body !== null && 'message' in body) {
      return typeof body.message === 'string' && body.message.trim() ? body.message : fallback;
    }
    return fallback;
  }
  return error instanceof Error && error.message ? error.message : fallback;
};
