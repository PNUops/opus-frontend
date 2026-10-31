import { http, HttpResponse } from 'msw';
import { mockVoteRanking, mockVoteStats, mockVoteLogs, mockMainStats } from '../data/statistics';
import { mockVoteReport, createMockVoteReportPdf } from '../data/voteReport';

const base = import.meta.env.VITE_API_BASE_URL ?? '';

export const statisticsHandlers = [
  http.get(`${base}/api/contests/:contestId/votes/report`, () => HttpResponse.json(mockVoteReport)),
  http.get(
    `${base}/api/contests/:contestId/votes/report/download`,
    () =>
      new HttpResponse(createMockVoteReportPdf(), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent('시연대회_투표결과.pdf')}`,
        },
      }),
  ),
  http.get(`${base}/api/statistics/summary`, () => HttpResponse.json(mockMainStats)),

  http.get(`${base}/api/contests/:contestId/ranking`, () => {
    return HttpResponse.json(mockVoteRanking);
  }),

  http.get(`${base}/api/contests/:contestId/votes/statistics`, () => {
    return HttpResponse.json(mockVoteStats);
  }),

  http.get(`${base}/api/contests/:contestId/vote-log`, () => {
    return HttpResponse.json(mockVoteLogs);
  }),
];
