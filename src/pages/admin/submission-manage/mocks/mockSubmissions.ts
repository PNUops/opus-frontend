import type { SubmissionFeedbackResponseDto, SubmissionStatusResponseDto } from '@dto/submissionDto';

const COMMENT_BODY =
  '자료 흐름은 명확하지만 실험 결과 설명이 조금 더 필요합니다. 예시로 첨부 파일을 참고해주세요. 자료 흐름은 명확하지만 실험 결과 설명이 조금 더 필요합니다. 예시로 첨부 파일을 참고해주세요.';

/** TODO: API 연동 전 임시 피드백 목데이터 (제출 ID 기반으로 합성) */
export const buildMockFeedbacks = (row: SubmissionStatusResponseDto): SubmissionFeedbackResponseDto[] =>
  Array.from({ length: 3 }, (_, index) => ({
    feedbackId: index + 1,
    memberId: index + 1,
    memberName: '김민수',
    roleType: 'ROLE_팀장',
    description: COMMENT_BODY,
    createdAt: '2026-05-14T21:47:00',
    updatedAt: '2026-05-14T21:47:00',
    files: Array.from({ length: index === 1 ? 1 : 3 }, (_, fileIndex) => ({
      fileId: fileIndex + 1,
      fileName: `AI데이터_${row.teamName}_참고자료.pdf`,
      fileSize: 13002342,
    })),
  }));
