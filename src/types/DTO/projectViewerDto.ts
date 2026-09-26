export interface TeamMember {
  memberStudentId: number;
  memberName: string;
}

export interface ProjectDetailsResponseDto {
  contestId: number;
  contestName: string;
  trackId: number;
  trackName: string;
  teamId: number;
  teamName: string;
  leaderId: number;
  projectName: string;
  professorName: string | null;
  leaderName: string;
  teamMembers: TeamMember[];
  overview: string;
  previewIds: number[];
  productionPath: string | null;
  githubPath: string;
  youTubePath: string;
  isLiked: boolean | null;
  isVoted: boolean | null;
}

export type PreviewResult =
  | { id?: number; status: 'success'; url: string }
  | { status: 'processing'; code: 'PREVIEW_PROCESSING' }
  | { status: 'error'; code: 'PREVIEW_NOTFOUND' | 'PREVIEW_ERR_ETC' };

export interface PreviewImagesResponseDto {
  imageResults: PreviewResult[];
}

export interface CommentCreateRequestDto {
  teamId: number;
  description: string;
  visibility: CommentVisibility;
}

export interface CommentsListRequestDto {
  teamId: number;
  visibility: CommentVisibility;
}

export type CommentVisibility = 'PUBLIC' | 'TEAM';

export type CommentMemberRoleType = 'ROLE_교수' | 'ROLE_외부멘토';

export interface CommentDto {
  commentId: number;
  description: string;
  visibility: CommentVisibility;
  memberId: number;
  memberName: string;
  memberRoleType: CommentMemberRoleType | null;
  teamId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentDeleteRequestDto {
  teamId: number;
  commentId: number;
}

export interface CommentEditRequestDto {
  teamId: number;
  commentId: number;
  description: string;
}

export interface CommentEditResponseDto {
  description: string;
}

export interface TeamVoteResponseDto {
  remainingVotesCount: number;
  maxVotesLimit: number;
}

export interface PreviewImage {
  id?: number;
  url: string | File;
}
