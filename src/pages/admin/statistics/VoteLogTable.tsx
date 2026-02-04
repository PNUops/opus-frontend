import { useQuery } from '@tanstack/react-query';
import { getVoteLog } from 'apis/statistics';
import dayjs from 'dayjs';

const VoteLogTable = () => {
  const {
    data: voteLogs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['voteLog'],
    queryFn: () => getVoteLog(),
  });

  if (isLoading) {
    return <div className="mt-6 text-center text-sm text-gray-500">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 text-sm text-red-500">
        투표 로그를 불러오는데 실패했습니다.
      </div>
    );
  }

  if (!voteLogs || voteLogs.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-500">
        투표 로그가 없습니다.
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-end gap-4">
        <h2 className="text-2xl font-bold">투표 순위</h2>
        <p className="text-midGray">투표 시각, 투표 대상 팀, 투표자 명, 투표자 이메일</p>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {voteLogs.map((v, idx) => (
          <div
            key={`${v.votedAt}-${v.teamName}-${idx}`}
            className="flex border-b last:border-b-0 [&>div]:px-5 [&>div]:py-4"
          >
            <div className="flex-1/3">{dayjs(v.votedAt).format('YYYY년 MM월 DD일 HH:mm')}</div>
            <div className="flex-1/6">{v.teamName}</div>
            <div className="flex-1/6">{v.voterName}</div>
            <div className="flex-1/3">{v.voterEmail ?? '-'}</div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VoteLogTable;
