import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../../constants/env';
import { mockContestBulkAddTeamsResponse, mockTracksAdminResponse } from '../data/contest';
import type { SubmissionItemRequestDto, SubmissionItemResponseDto } from '@dto/submissionDto';

const itemsByContest = new Map<string, SubmissionItemResponseDto[]>();

export const quickActionsHandlers = [
  http.get(`${API_BASE_URL}/api/contests/:contestId/tracks`, () => HttpResponse.json(mockTracksAdminResponse)),
  http.post(`${API_BASE_URL}/api/contests/:contestId/teams/bulk`, () =>
    HttpResponse.json(mockContestBulkAddTeamsResponse),
  ),
  http.get(`${API_BASE_URL}/api/contests/:contestId/submission-items`, ({ params }) =>
    HttpResponse.json(itemsByContest.get(String(params.contestId)) ?? []),
  ),
  http.post(`${API_BASE_URL}/api/contests/:contestId/submission-items`, async ({ params, request }) => {
    const payload = (await request.json()) as SubmissionItemRequestDto;
    const contestId = String(params.contestId);
    const items = itemsByContest.get(contestId) ?? [];
    const now = Date.now();
    const operationStatus =
      now < new Date(payload.startAt).getTime()
        ? 'SCHEDULED'
        : now > new Date(payload.endAt).getTime()
          ? 'CLOSED'
          : 'IN_PROGRESS';
    items.unshift({
      contestSubmissionItemId: Date.now(),
      name: payload.name,
      trackName: mockTracksAdminResponse.find((track) => track.trackId === payload.contestTrackId)?.trackName ?? null,
      startAt: payload.startAt,
      endAt: payload.endAt,
      allowLateSubmission: payload.allowLateSubmission,
      visibility: payload.visibility,
      operationStatus,
    });
    itemsByContest.set(contestId, items);
    return HttpResponse.json({}, { status: 201 });
  }),
];
