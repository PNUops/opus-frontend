import { TeamSortOption } from '@dto/contestsDto';

export const contestCreateSteps = ['대회 생성', '팀·참여자 설정', '필수 항목 설정'];

export const XLSX_MIME_TYPE = `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`;

export const sortOptions: { label: string; value: TeamSortOption }[] = [
  { label: '랜덤', value: 'RANDOM' },
  { label: '오름차순', value: 'ASC' },
  { label: '직접 설정', value: 'CUSTOM' },
];
