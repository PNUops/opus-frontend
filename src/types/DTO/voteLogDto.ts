// 아직 개발 진행중인 api라 변경 사항이 있을 수 있음

export interface VoteLogItemDto {
  votedAt: string;
  teamId?: number;
  teamName: string;
  voterName: string;
  voterEmail?: string;
}

export type VoteLogResponseDto = VoteLogItemDto[];
