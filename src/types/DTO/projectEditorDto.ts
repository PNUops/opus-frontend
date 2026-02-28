export interface ProjectDetailsEditDto {
  contestId: number;
  trackId: number;
  teamName: string;
  projectName: string;
  professorName: string;
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
