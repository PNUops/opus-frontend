export const admin_sections = [
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

export const user_sections = [{ title: '계정', links: [{ to: '/myaccount', label: '계정 관리' }] }];
