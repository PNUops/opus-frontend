import type { MyProjectDto } from '@dto/meDto';
import type { LayoutSidebarSection } from '@layout/common/LayoutSideBar';

interface CreateMyPageSidebarDataOptions {
  showAdvisorActivity?: boolean;
}

const myPageSidebarData: LayoutSidebarSection[] = [
  {
    title: '',
    links: [
      {
        to: 'activity',
        label: '나의 활동',
        icon: 'activity',
        activePaths: ['/me/activity', '/me/contests'],
      },
      { to: 'account', label: '계정 정보', icon: 'account' },
    ],
  },
];

export const createMyPageSidebarData = (
  projects: MyProjectDto[],
  options: CreateMyPageSidebarDataOptions = {},
): LayoutSidebarSection[] => {
  const activityLinks: LayoutSidebarSection['links'] = [
    {
      to: 'activity',
      label: '나의 활동',
      icon: 'activity',
      activePaths: ['/me/activity', '/me/contests'],
      links: projects.map(({ contestId, projectName, teamId, teamName }) => ({
        key: `team-${contestId}-${teamId}`,
        label: projectName || teamName,
        links: [
          {
            to: `contests/${contestId}/teams/${teamId}/dashboard`,
            label: '대시보드',
          },
          {
            to: `contests/${contestId}/teams/${teamId}/submissions`,
            label: '제출물',
          },
          {
            to: `/contest/${contestId}/teams/view/${teamId}`,
            label: '프로젝트 상세',
          },
        ],
      })),
    },
  ];

  if (options.showAdvisorActivity) {
    activityLinks.push({
      to: 'advisor-activity',
      label: '지도 활동',
      icon: 'advisorActivity',
      activePaths: ['/me/advisor-activity'],
    });
  }

  return [
    {
      title: '',
      links: [...activityLinks, { to: 'account', label: '계정 정보', icon: 'account' }],
    },
  ];
};

export const createMyTeamSidebarData = (projects: MyProjectDto[]): LayoutSidebarSection[] =>
  projects.length === 0 ? [] : createMyPageSidebarData(projects);

export default myPageSidebarData;
