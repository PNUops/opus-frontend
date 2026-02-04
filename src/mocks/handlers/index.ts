import { contestsHandler } from './contests';
import { noticesHandler } from './notices';
import { signInHandlers } from './sign-in';
import { signUpHandlers } from './sign-up';
import { statisticsHandlers } from './statistics';
import { teamsHandlers } from './teams';

export const handlers = [...contestsHandler, ...noticesHandler, ...statisticsHandlers];
