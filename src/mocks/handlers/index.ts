import { bannersHandler } from './banners';
import { contestsHandler } from './contests';
import { noticesHandler } from './notices';
import { signInHandlers } from './sign-in';
import { signUpHandlers } from './sign-up';
import { statisticsHandlers } from './statistics';
import { teamsHandlers } from './teams';
import { viewerHandlers } from './viewer';
import { meHandlers } from './meHandlers';

export const handlers = [
  ...contestsHandler,
  ...noticesHandler,
  ...statisticsHandlers,
  ...bannersHandler,
  ...viewerHandlers,
  ...signInHandlers,
  ...signUpHandlers,
  ...teamsHandlers,
  ...meHandlers,
];
