import { NoticeDetailDto, NoticeListDto } from '@dto/noticeDto';

export const mockNotices: NoticeListDto[] = [
  {
    noticeId: 1,
    title: '서비스 점검 안내: 6월 30일(월) 23:00-24:00까지 시스템 점검으로 서비스 이용이 일시 중단됩니다.',
    createdAt: '2025-06-30T14:00:00',
  },
  {
    noticeId: 2,
    title: '약관 변경 안내: 2025년 7월 1일부터 서비스 이용약관이 변경됩니다. 변경된 내용을 꼭 확인해 주세요.',
    createdAt: '2025-06-30T13:59:00',
  },
  {
    noticeId: 3,
    title: '이벤트 종료 안내: 6월 한정 진행된 출석체크 이벤트가 종료되었습니다. 참여해주신 모든 분께 감사드립니다.',
    createdAt: '2025-06-30T13:58:00',
  },
  {
    noticeId: 4,
    title:
      '버그 수정 및 안정화 업데이트 안내: 일부 이미지 업로드 오류 및 성능 이슈가 개선되었습니다. 쾌적한 사용 환경을 제공합니다.',
    createdAt: '2025-06-30T13:07:00',
  },
];

export const mockNoticeDetail: NoticeDetailDto = {
  title:
    '버그 수정 및 안정화 업데이트 안내: 일부 이미지 업로드 오류 및 성능 이슈가 개선되었습니다. 쾌적한 사용 환경을 제공합니다.',
  description: '일부 이미지 업로드 오류와 성능 이슈를 개선하여 보다 쾌적하고 안정적인 사용 환경을 제공합니다.',
  createdAt: '2025-07-01T09:15:23+09:00',
  updatedAt: '2025-07-01T09:15:23+09:00',
};
