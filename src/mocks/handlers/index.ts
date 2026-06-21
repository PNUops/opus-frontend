import { bannersHandler } from './banners';
import { contestsHandler } from './contests';
import { noticesHandler } from './notices';
import { signInHandlers } from './sign-in';
import { signUpHandlers } from './sign-up';
import { statisticsHandlers } from './statistics';
import { teamsHandlers } from './teams';
import { viewerHandlers } from './viewer';
import { notificationsHandlers } from './notifications';

export const handlers = [
  ...contestsHandler,
  ...noticesHandler,
  ...notificationsHandlers,
  ...statisticsHandlers,
  ...bannersHandler,
  ...viewerHandlers,
  ...signInHandlers,
  ...signUpHandlers,
  ...teamsHandlers,
];
