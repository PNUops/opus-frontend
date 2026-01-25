export interface ProjectDetailsEditDto {
  contestId: number;
  contestName: string;
  divisionId: number;
  divisionName: string;
  teamId: number;
  teamName: string;
  projectName: string;
  professorName: string;
  leaderName: string;
  overview: string;
  productionPath: string | null;
  githubPath: string;
  youTubePath: string;
}

export interface PreviewDeleteRequestDto {
  imageIds: number[];
}

export interface TeamMemberCreateRequestDto {
  teamMemberName: string;
}
