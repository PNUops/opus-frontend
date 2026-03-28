import { AwardDto } from '../awardsDto';

export interface TeamListItemResponseDto {
  teamId: number;
  teamName: string;
  projectName: string;
  isLiked: boolean;
  isVoted: boolean;
  awards: AwardDto[];
}
