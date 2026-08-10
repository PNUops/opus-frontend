import { queryOptions, type QueryClient } from '@tanstack/react-query';
import { getAllContests, getContestTeams, getCurrentContest, getSortStatus } from '@apis/contest';
import { teamDetailOption } from './team';

const ARCHIVE_PROJECT_LIMIT = 3;
const ARCHIVE_CONTEST_LIMIT = 3;

export const contestsOption = () => {
  return queryOptions({ queryKey: ['contests'], queryFn: getAllContests });
};

export const currentContestOption = () => {
  return queryOptions({ queryKey: ['currentContests'], queryFn: getCurrentContest });
};

export const contestTeamOption = (contestId: number) => {
  return queryOptions({ queryKey: ['teams', contestId], queryFn: () => getContestTeams(contestId) });
};

export const sortStatusOption = (contestId: number) => {
  return queryOptions({ queryKey: ['sortStatus'], queryFn: () => getSortStatus(contestId) });
};

export const archiveProjectsOption = (queryClient: QueryClient) =>
  queryOptions({
    queryKey: ['archiveProjects'],
    queryFn: async () => {
      const contests = await queryClient.fetchQuery(contestsOption());
      // TODO: 공개 프로젝트 목록 API가 project.updatedAt과 정렬/페이지네이션을 제공하면
      // 대회 수정일 기반의 이 fallback 정책을 프로젝트 최신 업데이트순으로 교체한다.
      const archiveContests = contests
        .filter((contest) => !contest.isCurrent)
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, ARCHIVE_CONTEST_LIMIT);

      const teamGroups = await Promise.all(
        archiveContests.map(async (contest) => ({
          contest,
          teams: await queryClient.fetchQuery(contestTeamOption(contest.contestId)),
        })),
      );
      const candidates = teamGroups
        .flatMap(({ contest, teams }) =>
          teams.filter((team) => team.projectName.trim().length > 0).map((team) => ({ contest, team })),
        )
        .slice(0, ARCHIVE_PROJECT_LIMIT);

      const details = await Promise.allSettled(
        candidates.map(({ team }) => queryClient.fetchQuery(teamDetailOption(team.teamId))),
      );

      return candidates.map(({ contest, team }, index) => {
        const detail = details[index].status === 'fulfilled' ? details[index].value : undefined;

        return {
          contestId: contest.contestId,
          contestName: contest.contestName,
          teamId: team.teamId,
          projectName: detail?.projectName?.trim() || team.projectName,
          overview: detail?.overview?.trim() ?? '',
        };
      });
    },
  });
