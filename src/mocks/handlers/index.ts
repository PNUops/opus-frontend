
import { contestsHandler } from './contests';
import { noticesHandler } from './notices';
import { signInHandlers } from './sign-in';
import { signUpHandlers } from './sign-up';
import { teamsHandlers } from './teams';
import { voteHandlers } from './vote';
import { participationRateHandlers, voteStatisticsHandlers, likeRankingHandlers, voteLogHandlers } from './statistics';

export const handlers = [
	...contestsHandler,
	...noticesHandler,
	...voteHandlers,
	...participationRateHandlers,
	...voteStatisticsHandlers,
	...likeRankingHandlers,
	...voteLogHandlers,
];
