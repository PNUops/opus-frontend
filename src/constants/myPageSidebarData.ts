import type { AdvisorContestDto } from '@dto/advisorDto';
import type { MyProjectDto } from '@dto/meDto';
import type { LayoutSidebarSection } from '@layout/common/LayoutSideBar';

interface CreateMyPageSidebarDataOptions {
  advisorContests?: AdvisorContestDto[];
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
    { to: 'account', label: '계정 정보', icon: 'account' },
  ];

  if (options.showAdvisorActivity) {
    activityLinks.unshift({
      to: 'advisor-activity',
      label: '지도 활동',
      icon: 'advisorActivity',
      activePaths: ['/me/advisor-activity'],
      links: options.advisorContests?.map(({ contestId, contestName }) => ({
        key: `advisor-contest-${contestId}`,
        to: `advisor-activity/contests/${contestId}`,
        label: contestName,
      })),
    });
  }

  return [
    {
      title: '',
      links: [...activityLinks],
    },
  ];
};

export default myPageSidebarData;
