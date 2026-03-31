const adminContestSidebarData = [
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
    title: '대회',
    links: [
      { to: 'manage', label: '대회 관리' },
      { to: 'team-setting', label: '팀·참여자 설정' },
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
