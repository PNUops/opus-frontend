import { queryOptions } from '@tanstack/react-query';

/**
 * Usage
 * ```javascript
 * // 팀 이미지 조회(썸네일) API 호출 시: /teams/{teamId}/image/thumbnail
 * useQuery(
 *  {
 *    queryKey: queryOption.teams.thumbnail(teamId).queryKey,
 *    queryFn: ...
 *  }
 * );
 * ```
 *
 * queryOption 필드 명명법
 * 1. queryOption.도메인.마지막정적세그먼트.queryKey로 접근할 수 있도록 한다.
 * 2. /teams/{teamId} 처럼 마지막 정적 세그먼트가 도메인이라면 api 명으로 별칭을 지정한다.
 *  ex) 팀 (상세보기) 조회 => detail
 * 3. /teams 처럼 도메인이 마지막 세그먼트라면 root를 사용한다.
 * 4. 마지막 세그먼트에 '-'등이 포함되어있다면 camelCase로 변환하여 사용한다.
 * 5. 기타 예외적인 상황의 경우 다른 개발자가 적절히 활요할 수 있는 필드명으로 명명한다.
 * 6. queryKey는 동적인 uri를 직접 사용하여 검색이 용이하도록 한다.
 *  ex) ['comment', teamId] => [`/teams/${teamId}/comments`]
 */

const queryOption = {
  teams: {
    image: (teamId: number, imageId: number) => queryOptions({ queryKey: [`/teams/${teamId}/image/${imageId}`] }),
    thumbnail: (teamId: number) => queryOptions({ queryKey: [`/teams/${teamId}/image/thumbnail`] }),
    submissionStatus: () => queryOptions({ queryKey: [`/teams/submission-status`] }),
    detail: (teamId: number) => queryOptions({ queryKey: [`/teams/${teamId}`] }),
    comments: (teamId: number) => queryOptions({ queryKey: [`/teams/${teamId}/comments`] }),
  },
  contests: {
    teams: (contestId: number, userId?: number) => queryOptions({ queryKey: [`/contests/${contestId}/teams`, userId] }),
    current: (userId?: number) => queryOptions({ queryKey: [`/contests/current`, userId] }),
    root: () => queryOptions({ queryKey: [`/contests`] }),
  },
  oauth: {
    google: () => queryOptions({ queryKey: [`/oauth/google`] }),
    callback: () => queryOptions({ queryKey: [`/oauth/google/callback`] }),
  },
  admin: {
    dashboard: () => queryOptions({ queryKey: [`/admin/dashboard`] }),
    ranking: () => queryOptions({ queryKey: [`/admin/ranking`] }),
    participationRate: () => queryOptions({ queryKey: [`/admin/participation-rate`] }),
  },
  notices: {
    detail: (noticeId: number) => queryOptions({ queryKey: [`/notices/${noticeId}`] }),
    root: () => queryOptions({ queryKey: [`/notices`] }),
  },
  signIn: {
    emailFind: (studentId: number) => queryOptions({ queryKey: [`/sign-in/${studentId}/email-find`] }),
  },
} as const;

export default queryOption;
