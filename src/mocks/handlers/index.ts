import { bannersHandler } from './banners';
import { contestsHandler } from './contest';
import { noticesHandler } from './notices';
import { signInHandlers } from './sign-in';
import { signUpHandlers } from './sign-up';
import { statisticsHandlers } from './statistics';
import { teamsHandlers } from './teams';
import { meHandlers } from './me';
import { memberHandlers } from './member';
import { teamCommentsHandlers } from './teamComments';
import { notificationScenarioHandlers } from './notificationScenario';
import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../../constants/env';

export const handlers = [
  ...notificationScenarioHandlers,
  ...contestsHandler,
  ...noticesHandler,
  ...statisticsHandlers,
  ...bannersHandler,
  ...signInHandlers,
  ...signUpHandlers,
  ...teamsHandlers,
  ...meHandlers,
  ...memberHandlers,
  ...teamCommentsHandlers,
  ...(import.meta.env.MODE === 'mock'
    ? [
        http.all(`${API_BASE_URL}/api/*`, () =>
          HttpResponse.json({ message: '이 API는 MSW 시나리오에 없습니다.' }, { status: 501 }),
        ),
      ]
    : []),
];
