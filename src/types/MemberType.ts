export type MemberType =
  | 'ROLE_관리자'
  | 'ROLE_회원'
  | 'ROLE_학생'
  | 'ROLE_팀장'
  | 'ROLE_팀원'
  | 'ROLE_교수'
  | 'ROLE_직원'
  | 'ROLE_외부멘토';

export type TeamMemberType = Extract<MemberType, 'ROLE_팀장' | 'ROLE_팀원'>;
