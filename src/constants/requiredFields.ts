import { RequiredFieldsDto } from 'types/DTO/requiredFieldsDto';

const REQUIRED_FIELD_CONFIG = [
  { key: 'trackRequired', label: '분과' },
  { key: 'projectNameRequired', label: '프로젝트명' },
  { key: 'teamNameRequired', label: '팀명' },
  { key: 'leaderRequired', label: '팀장' },
  { key: 'teamMembersRequired', label: '팀원' },
  { key: 'professorRequired', label: '지도교수' },
  { key: 'githubPathRequired', label: 'GitHub 링크' },
  { key: 'youTubePathRequired', label: 'YouTube 링크' },
  { key: 'productionPathRequired', label: '배포 링크' },
  { key: 'overviewRequired', label: '프로젝트 개요' },
  { key: 'posterRequired', label: '포스터' },
  { key: 'imagesRequired', label: '이미지' },
] as const;

export type RequiredFieldKey = (typeof REQUIRED_FIELD_CONFIG)[number]['key'];

export const defaultRequiredFields = Object.fromEntries(
  REQUIRED_FIELD_CONFIG.map(({ key }) => [key, false]),
) as RequiredFieldsDto;

export const labelByField = Object.fromEntries(REQUIRED_FIELD_CONFIG.map(({ key, label }) => [key, label])) as Record<
  RequiredFieldKey,
  string
>;
