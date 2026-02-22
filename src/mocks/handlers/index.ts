import { contestsHandler } from './contests';
import { noticesHandler } from './notices';
import { signInHandlers } from './sign-in';
import { signUpHandlers } from './sign-up';
import { teamsHandlers } from './teams';
import { viewerHandlers } from './viewer';

export const handlers = [...contestsHandler, ...noticesHandler, ...viewerHandlers];
