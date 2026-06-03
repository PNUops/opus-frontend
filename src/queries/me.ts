import type { QueryClient } from '@tanstack/react-query';

export const MY_PROJECTS_QUERY_KEY = ['myProjects'] as const;
export const MY_VOTES_QUERY_KEY = ['myVotes'] as const;
export const MY_LIKES_PREVIEW_QUERY_KEY = ['myLikesPreview'] as const;
export const MY_LIKES_QUERY_KEY = ['myLikes'] as const;
export const MY_COMMENTS_QUERY_KEY = ['myComments'] as const;

export const invalidateMyLikeActivityQueries = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: MY_LIKES_PREVIEW_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: MY_LIKES_QUERY_KEY }),
  ]);

export const invalidateMyVoteActivityQueries = (queryClient: QueryClient) =>
  queryClient.invalidateQueries({ queryKey: MY_VOTES_QUERY_KEY });

export const invalidateMyActivityQueries = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: MY_PROJECTS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: MY_VOTES_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: MY_LIKES_PREVIEW_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: MY_LIKES_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: MY_COMMENTS_QUERY_KEY }),
  ]);
