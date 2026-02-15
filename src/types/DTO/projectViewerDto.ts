export interface TeamMember {
  teamMemberId: number;
  teamMemberName: string;
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
  overview: string;
  professorName: string | null;
  leaderName: string;
  teamMembers: TeamMember[];
  previewIds: number[];
  productionPath: string | null;
  githubPath: string;
  youTubePath: string;
  isLiked: boolean | null;
  isVoted: boolean | null;
}

export type PreviewResult =
  | { id: number; status: 'success'; url: string }
  | { status: 'processing'; code: 'PREVIEW_PROCESSING' }
  | { status: 'error'; code: 'PREVIEW_NOTFOUND' | 'PREVIEW_ERR_ETC' };

export interface PreviewImagesResponseDto {
  imageResults: PreviewResult[];
}

export interface CommentCreateRequestDto {
  teamId: number;
  description: string;
}

export interface CommentsListRequestDto {
  teamId: number;
}

export interface CommentDto {
  commentId: number;
  description: string;
  memberId: number;
  memberName: string;
  teamId: number;
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

export interface LikeUpdateRequestDto {
  teamId: number;
  isLiked: boolean;
}
export interface LikeUpdateResponseDto {
  teamId: number;
  isLiked: boolean;
  message: string;
  remainingLikeCount: number;
  maxLikeCount: number;
}

export interface PreviewImage {
  id?: number;
  url: string | File;
}
