export interface ProjectDetailsEditDto {
  contestId: number;
  trackId: number;
  teamName: string | null;
  projectName: string | null;
  professorName: string | null;
  overview: string | null;
  productionPath: string | null;
  githubPath: string | null;
  youTubePath: string | null;
}

export interface PreviewDeleteRequestDto {
  imageIds: number[];
}

export interface TeamMemberCreateRequestDto {
  teamMemberName: string;
  teamMemberStudentId: string;
  roleType: 'ROLE_팀장' | 'ROLE_팀원';
}
