import type { CommentVisibility } from '@dto/projectViewerDto';

export const teamCommentKeys = {
  all: ['team-comments'] as const,
  list: (teamId: number, visibility: CommentVisibility) => [...teamCommentKeys.all, teamId, visibility] as const,
};
