import { useQuery } from '@tanstack/react-query';
import { useContestIdOrRedirect } from 'hooks/useId';
import { getVoteLog } from 'apis/statistics';
import dayjs from 'dayjs';
import { AdminNoData } from '@components/admin';
import { useState } from 'react';
import Pagination from '@components/Pagination';

const VoteLogTable = () => {
  const contestId = useContestIdOrRedirect();
  const [page, setPage] = useState<number>(1);

  const { data: voteLogs } = useQuery({
    queryKey: ['voteLog', contestId, page - 1],
    queryFn: () => getVoteLog(contestId, { page: page - 1, size: 20 }),
  });

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end gap-4">
        <h2 className="text-2xl font-bold">투표 로그</h2>
        <p className="text-midGray">투표 시각 | 투표 대상 팀 | 투표자 이름 | 투표자 이메일</p>
      </div>
      <div>
        {voteLogs && voteLogs.totalElements ? (
          voteLogs.content.map((v, idx) => (
            <div
              key={`${v.votedAt}-${v.teamName}-${idx}`}
              className="flex border-b last:border-b-0 [&>div]:px-5 [&>div]:py-4"
            >
              <div className="flex-1/3">{dayjs(v.votedAt).format('YYYY년 MM월 DD일 HH:mm')}</div>
              <div className="flex-1/6">{v.teamName}</div>
              <div className="flex-1/6">{v.voterName}</div>
              <div className="flex-1/3">{v.voterEmail ?? '-'}</div>
            </div>
          ))
        ) : (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
            <AdminNoData />
          </div>
        )}
      </div>
      {voteLogs && (
        <Pagination currentPage={page} onPageChange={(page) => setPage(page)} totalPages={voteLogs.totalPages} />
      )}
    </section>
  );
};

export default VoteLogTable;
