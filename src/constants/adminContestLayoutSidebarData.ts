export interface AdminContestSidebarLink {
  to: string;
  label: string;
}

export interface AdminContestSidebarSection {
  title: string;
  links: AdminContestSidebarLink[];
}

const adminContestSidebarData: AdminContestSidebarSection[] = [
  {
    title: '프로젝트',
    links: [
      { to: 'projects', label: '프로젝트 관리' },
      { to: 'team-order', label: '정렬 관리' },
      { to: 'awards', label: '수상 관리' },
      { to: 'required-fields', label: '필수 항목 설정' },
    ],
  },
  {
    title: '참여자/역할',
    links: [{ to: 'roles', label: '지도교수 및 멘토 지정' }],
  },
  {
    title: '대회',
    links: [
      { to: 'settings', label: '대회 관리' },
      { to: 'tracks', label: '분과 관리' },
      { to: 'votes', label: '투표 관리' },
      { to: 'notices', label: '공지 관리' },
      { to: 'banners', label: '배너 관리' },
    ],
  },
  {
    title: '통계',
    links: [{ to: 'statistics', label: '대회 통계' }],
  },
];

export default adminContestSidebarData;
