import { RequiredFieldsDto } from 'types/DTO/requiredFieldsDto';

export const defaultRequiredFields: RequiredFieldsDto = {
  trackRequired: false,
  projectNameRequired: false,
  teamNameRequired: false,
  leaderRequired: false,
  teamMembersRequired: false,
  professorRequired: false,
  githubPathRequired: false,
  youtubePathRequired: false,
  productionPathRequired: false,
  overviewRequired: false,
  posterRequired: false,
  imagesRequired: false,
};

export const labelByField: Record<string, string> = {
  trackRequired: '분과',
  projectNameRequired: '프로젝트명',
  teamNameRequired: '팀명',
  leaderRequired: '팀장',
  teamMembersRequired: '팀원',
  professorRequired: '지도교수',
  githubPathRequired: 'GitHub 링크',
  youtubePathRequired: 'Youtube 링크',
  productionPathRequired: '배포 링크',
  overviewRequired: '프로젝트 개요',
  posterRequired: '포스터',
  imagesRequired: '이미지',
};
