import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { AdminHeader, AdminNoData } from '@components/admin';
import Pagination from '@components/Pagination';
import { useContestIdOrRedirect } from 'hooks/useId';
import { getVoteLog } from 'apis/statistics';
import QueryWrapper from 'providers/QueryWrapper';

const VoteLogSection = () => {
  return (
    <section className="flex flex-col gap-5">
      <AdminHeader title="투표 로그" description="투표 시각 | 투표 대상 팀 | 투표자 이름 | 투표자 이메일" />
      <QueryWrapper loadingStyle="h-60 my-0 rounded-sm" errorStyle="h-60">
        <VoteLogList />
      </QueryWrapper>
    </section>
  );
};

export default VoteLogSection;

const VoteLogList = () => {
  const contestId = useContestIdOrRedirect();
  const [page, setPage] = useState<number>(1);

  const { data: voteLogs } = useSuspenseQuery({
    queryKey: ['voteLog', contestId, page - 1],
    queryFn: () => getVoteLog(contestId, { page: page - 1, size: 20 }),
  });

  if (voteLogs.totalElements === 0) return <AdminNoData className="h-30" />;

  return (
    <div className="flex flex-col gap-5">
      {voteLogs.content.map((v) => (
        <div key={`${v.votedAt}-${v.voterName}`} className="flex border-b last:border-b-0 [&>div]:px-5 [&>div]:py-4">
          <div className="flex-1/3">{dayjs(v.votedAt).format('YYYY년 MM월 DD일 HH:mm')}</div>
          <div className="flex-1/6">{v.teamName}</div>
          <div className="flex-1/6">{v.voterName}</div>
          <div className="flex-1/3">{v.voterEmail ?? '-'}</div>
        </div>
      ))}

      <Pagination currentPage={page} onPageChange={(page) => setPage(page)} totalPages={voteLogs.totalPages} />
    </div>
  );
};
