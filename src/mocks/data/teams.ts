import { ProjectDetailsResponseDto } from '../../types/DTO/projectViewerDto';

export const mockTeamDetail: ProjectDetailsResponseDto = {
  contestId: 1,
  contestName: '2026 소프트웨어 캡스톤 디자인',
  trackId: 3,
  trackName: 'AI & 데이터',
  teamId: 101,
  teamName: '팀 노바',
  leaderId: 1001,
  projectName: '외국인 정착 지원 플랫폼',
  overview: '외국인의 한국 정착을 돕기 위해 맞춤형 가이드, 정착 로드맵, 커뮤니티 기능을 제공하는 플랫폼입니다.',
  professorName: '김민수 교수',
  leaderName: '홍지연',
  teamMembers: [
    {
      teamMemberId: 1001,
      teamMemberName: '홍지연',
    },
    {
      teamMemberId: 1002,
      teamMemberName: '이동혁',
    },
    {
      teamMemberId: 1003,
      teamMemberName: '박민지',
    },
  ],
  previewIds: [501, 502, 503],
  productionPath: 'https://forink.app',
  githubPath: 'https://github.com/forink/platform',
  youTubePath: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  isLiked: true,
  isVoted: false,
};

export const mockTeams = [
  {
    teamId: 1,
    teamName: '코드크래프트',
    projectName: 'AI 기반 개인 비서 서비스',
    isLiked: true,
    awards: [
      { awardName: '대상', awardColor: '#FFD700' },
      { awardName: '인기상', awardColor: '#FF6B6B' },
    ],
  },
  {
    teamId: 2,
    teamName: '블루웨이브',
    projectName: '친환경 에코 트래킹 앱',
    isLiked: false,
    awards: [{ awardName: '최우수상', awardColor: '#00A3FF' }],
  },
  {
    teamId: 3,
    teamName: '데이터마이닝',
    projectName: '실시간 교통량 예측 시스템',
    isLiked: false,
    awards: [],
  },
  {
    teamId: 4,
    teamName: '픽셀아트',
    projectName: '커스텀 굿즈 제작 플랫폼',
    isLiked: true,
    awards: [{ awardName: '특별상', awardColor: '#A362FF' }],
  },
  {
    teamId: 5,
    teamName: '보안전문가들',
    projectName: '제로 트러스트 네트워크 보안 솔루션',
    isLiked: false,
    awards: [],
  },
  {
    teamId: 6,
    teamName: '헬스메이트',
    projectName: '개인 맞춤형 식단 관리 솔루션',
    isLiked: true,
    awards: [{ awardName: '우수상', awardColor: '#4CAF50' }],
  },
  {
    teamId: 7,
    teamName: '그린팜',
    projectName: 'IoT 기반 스마트 팜 자동 제어',
    isLiked: false,
    awards: [{ awardName: '대상', awardColor: '#FFD700' }],
  },
  {
    teamId: 8,
    teamName: '에듀테크',
    projectName: '메타버스 활용 온라인 강의실',
    isLiked: true,
    awards: [{ awardName: '최우수상', awardColor: '#00A3FF' }],
  },
  {
    teamId: 9,
    teamName: '핀테크커넥트',
    projectName: '소액 투자 자동화 플랫폼',
    isLiked: false,
    awards: [],
  },
  {
    teamId: 10,
    teamName: '트래블로그',
    projectName: '로컬 경험 중심 여행 플래너',
    isLiked: true,
    awards: [{ awardName: '인기상', awardColor: '#FF6B6B' }],
  },
  {
    teamId: 11,
    teamName: '비전마스터',
    projectName: '딥러닝 기반 실시간 객체 인식',
    isLiked: false,
    awards: [{ awardName: '장려상', awardColor: '#9E9E9E' }],
  },
  {
    teamId: 12,
    teamName: '커뮤니티허브',
    projectName: '지역 기반 이웃 나눔 서비스',
    isLiked: false,
    awards: [],
  },
  {
    teamId: 13,
    teamName: '리사이클러',
    projectName: '폐기물 배출 가이드 챗봇',
    isLiked: true,
    awards: [
      { awardName: '최우수상', awardColor: '#00A3FF' },
      { awardName: '아이디어상', awardColor: '#FF9800' },
    ],
  },
  {
    teamId: 14,
    teamName: '펫러버',
    projectName: '반려동물 건강 이상 징후 감지 앱',
    isLiked: true,
    awards: [{ awardName: '우수상', awardColor: '#4CAF50' }],
  },
  {
    teamId: 15,
    teamName: '스카이아이',
    projectName: '드론 활용 교량 안전 점검 시스템',
    isLiked: false,
    awards: [],
  },
  {
    teamId: 16,
    teamName: '마인드케어',
    projectName: '심리 상담 연결 서비스',
    isLiked: true,
    awards: [{ awardName: '대상', awardColor: '#FFD700' }],
  },
  {
    teamId: 17,
    teamName: '블록체인랩',
    projectName: '투명한 기부금 관리 시스템',
    isLiked: false,
    awards: [],
  },
  {
    teamId: 18,
    teamName: '스마트홈',
    projectName: '에너지 절약형 가전 제어 허브',
    isLiked: false,
    awards: [{ awardName: '우수상', awardColor: '#4CAF50' }],
  },
  {
    teamId: 19,
    teamName: '커리어점프',
    projectName: 'IT 취준생 포트폴리오 관리 툴',
    isLiked: false,
    awards: [],
  },
  {
    teamId: 20,
    teamName: '볼런티어',
    projectName: '봉사 활동 매칭 플랫폼',
    isLiked: true,
    awards: [
      { awardName: '인기상', awardColor: '#FF6B6B' },
      { awardName: '특별상', awardColor: '#A362FF' },
    ],
  },
];

export const mockTeamLeaderMessage = {
  teamId: 1,
  teamName: 'team1',
  projectName: 'team1 Project',
  isSubmitted: false,
};

export const mockTeamAwards = [
  {
    awardId: 1,
    awardName: '대상',
    awardColor: '#FFD700',
    contestId: 5,
  },
  {
    awardId: 3,
    awardName: '최우수상',
    awardColor: '#C0C0C0',
    contestId: 5,
  },
];
