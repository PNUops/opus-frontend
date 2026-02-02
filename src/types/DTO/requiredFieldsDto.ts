export type RequiredFieldsType = 'REQUIRED' | 'OPTIONAL';

export interface RequiredFieldsDto {
  division: RequiredFieldsType;
  projectName: RequiredFieldsType;
  teamName: RequiredFieldsType;
  leader: RequiredFieldsType;
  teamMembers: RequiredFieldsType;
  professor: RequiredFieldsType;
  githubPath: RequiredFieldsType;
  youtubePath: RequiredFieldsType;
  productionPath: RequiredFieldsType;
  overview: RequiredFieldsType;
  poster: RequiredFieldsType;
  images: RequiredFieldsType;
}
