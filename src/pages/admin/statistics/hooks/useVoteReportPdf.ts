import { useCallback, useEffect, useRef, useState } from 'react';
import type { AxiosResponse } from 'axios';
import { getVoteReportErrorMessage, getVoteReportPdf } from '@apis/voteReport';
import { downloadFromResponse } from '@utils/download';

type PdfMode = 'preview' | 'download';
type PdfState =
  | { status: 'idle' }
  | { status: 'loading'; mode: PdfMode }
  | { status: 'ready'; url: string }
  | { status: 'error'; mode: PdfMode; message: string };

export const useVoteReportPdf = (contestId: number, enabled: boolean) => {
  const [state, setState] = useState<PdfState>({ status: 'idle' });
  const requestRef = useRef<AbortController | null>(null);
  const responseRef = useRef<AxiosResponse<Blob> | null>(null);
  const urlRef = useRef<string | null>(null);

  const clearResources = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    responseRef.current = null;
  }, []);

  const close = useCallback(() => {
    clearResources();
    setState({ status: 'idle' });
  }, [clearResources]);

  useEffect(() => {
    close();
    return clearResources;
  }, [contestId, enabled, close, clearResources]);

  const request = async (mode: PdfMode) => {
    if (!enabled || requestRef.current) return;
    if (responseRef.current && mode === 'download') {
      try {
        downloadFromResponse(responseRef.current, '투표결과.pdf');
      } catch {
        clearResources();
        setState({ status: 'error', mode: 'preview', message: '파일을 다운로드하지 못했어요. 다시 시도해 주세요.' });
      }
      return;
    }
    const controller = new AbortController();
    requestRef.current = controller;
    setState({ status: 'loading', mode });
    try {
      const response = await getVoteReportPdf(contestId, controller.signal);
      if (controller.signal.aborted || requestRef.current !== controller) return;
      if (mode === 'preview') {
        const url = URL.createObjectURL(response.data);
        responseRef.current = response;
        urlRef.current = url;
        setState({ status: 'ready', url });
      } else {
        downloadFromResponse(response, '투표결과.pdf');
        setState({ status: 'idle' });
      }
    } catch (error) {
      const message = await getVoteReportErrorMessage(error, 'PDF를 생성하지 못했어요. 잠시 후 다시 시도해 주세요.');
      if (!controller.signal.aborted && requestRef.current === controller) setState({ status: 'error', mode, message });
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  };

  return {
    state,
    isOpen: state.status === 'ready' || (state.status !== 'idle' && state.mode === 'preview'),
    isLoading: state.status === 'loading',
    preview: () => request('preview'),
    download: () => request('download'),
    close,
  };
};
