import { ContestResponseDto } from 'types/DTO';
import { ProjectsAdminResponseDto } from 'types/DTO';

export const mockContestsResponse: ContestResponseDto[] = [
  {
    contestId: 1,
    contestName: '제6회PNU창의융합SW해커톤',
    updatedAt: new Date('2025-06-28T14:30:00Z'),
  },
  {
    contestId: 2,
    contestName: '제5회PNU창의융합SW해커톤',
    updatedAt: new Date('2025-06-20T09:15:45Z'),
  },
  {
    contestId: 3,
    contestName: '제4회PNU창의융합SW해커톤',
    updatedAt: new Date('2025-06-20T09:15:45Z'),
  },
  {
    contestId: 4,
    contestName: '제3회PNU창의융합SW해커톤',
    updatedAt: new Date('2025-06-20T09:15:45Z'),
  },
];

export const mockProjectsAdminResponse: ProjectsAdminResponseDto[] = [
  {
    teamId: 1,
    teamName: '슈퍼팀',
    projectName: 'AI 프로젝트',
    divisionName: 'AI 트랙',
    isSubmitted: true,
  },
  {
    teamId: 2,
    teamName: 'OPS A',
    projectName: 'AI 기반 문제추천',
    divisionName: 'AI 트랙',
    isSubmitted: true,
  },
  {
    teamId: 3,
    teamName: 'OPS B',
    projectName: '수어 번역기',
    divisionName: '웹 개발 트랙',
    isSubmitted: false,
  },
  {
    teamId: 4,
    teamName: 'OPS C',
    projectName: 'AI 면접 분석기',
    divisionName: 'AI 트랙',
    isSubmitted: true,
  },
  {
    teamId: 5,
    teamName: 'OPS D',
    projectName: '헬스 자세 교정 AI',
    divisionName: 'AI 트랙',
    isSubmitted: false,
  },
];
