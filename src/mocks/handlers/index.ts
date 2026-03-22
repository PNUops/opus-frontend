import { bannersHandler } from './banners';
import { contestsHandler } from './contests';
import { noticesHandler } from './notices';
import { signInHandlers } from './sign-in';
import { signUpHandlers } from './sign-up';
import { statisticsHandlers } from './statistics';
import { teamsHandlers } from './teams';
import { meHandlers } from './me';
import { memberHandlers } from './member';

export const handlers = [
  ...contestsHandler,
  ...noticesHandler,
  ...statisticsHandlers,
  ...bannersHandler,
  ...signInHandlers,
  ...signUpHandlers,
  ...teamsHandlers,
  ...meHandlers,
  ...memberHandlers,
];
