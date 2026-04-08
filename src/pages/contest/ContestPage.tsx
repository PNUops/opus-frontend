import { useQuery } from '@tanstack/react-query';
import { NoticeListSkeleton } from '@components/notice';
import useContestName from 'hooks/useContestName';
import { useContestIdOrRedirect } from 'hooks/useId';
import QueryWrapper from 'providers/QueryWrapper';
import ContestNoticeList from './ContestNoticeList';
import TeamCardGrid from '@pages/contest/TeamCardGrid';
import { contestTeamOption } from 'queries/contest';

const ContestPage = () => {
  const contestId = useContestIdOrRedirect();
  const contestName = useContestName();
  const { data: teams, isLoading, isError } = useQuery(contestTeamOption(contestId));

  return (
    <div className="flex flex-col gap-8">
      <h3 className="lg:text-title text-2xl font-bold">{contestName ?? ''}</h3>
      <QueryWrapper loadingFallback={<NoticeListSkeleton />} errorStyle="h-36 rounded-xl shadow-md">
        <ContestNoticeList />
      </QueryWrapper>
      <TeamCardGrid teams={teams} isLoading={isLoading} isError={isError} />
    </div>
  );
};

export default ContestPage;
