import { RequiredFieldsDto } from 'types/DTO/requiredFieldsDto';

export const defaultRequiredFields: RequiredFieldsDto = {
  division: 'OPTIONAL',
  projectName: 'OPTIONAL',
  teamName: 'OPTIONAL',
  leader: 'OPTIONAL',
  teamMembers: 'OPTIONAL',
  professor: 'OPTIONAL',
  githubPath: 'OPTIONAL',
  youtubePath: 'OPTIONAL',
  productionPath: 'OPTIONAL',
  overview: 'OPTIONAL',
  poster: 'OPTIONAL',
  images: 'OPTIONAL',
};

export const labelByField: Record<string, string> = {
  division: '분과',
  projectName: '프로젝트명',
  teamName: '팀명',
  leader: '팀장',
  teamMembers: '팀원',
  professor: '지도교수',
  githubPath: 'GitHub 링크',
  youtubePath: 'Youtube 링크',
  productionPath: '배포 링크',
  overview: '프로젝트 개요',
  poster: '포스터',
  images: '이미지',
};
