export interface AwardDto {
  awardName: string | null;
  awardColor: string | null;
}

export interface TeamAwardDto {
  awardId: number;
  awardName: string;
  awardColor: string;
  contestId: number;
}