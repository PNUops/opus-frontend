import { http, HttpResponse } from 'msw';
import type { CurrentContestResponseDto } from '../../../../../src/types/DTO/contestsDto';

export const handlers = [
  http.get('/api/contests/current', () => HttpResponse.json([] satisfies CurrentContestResponseDto[])),
];
