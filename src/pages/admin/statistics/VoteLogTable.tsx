import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getVoteLog } from 'apis/voteLog';
import { formatDateTimeKorean } from 'utils/time';
import type { VoteLogItemDto } from 'types/DTO/voteLogDto';

const VoteLogTable: React.FC = () => {
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
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white text-sm">
      <div className="w-full overflow-x-auto">
        <table className="w-full table-auto text-left">
          <thead>
            <tr className="border-b">
              <th className="px-6 py-4 text-sm text-gray-500">투표 시각</th>
              <th className="px-6 py-4 text-sm text-gray-500">투표받은 팀</th>
              <th className="px-6 py-4 text-sm text-gray-500">투표자 명</th>
              <th className="px-6 py-4 text-sm text-gray-500">메일 주소</th>
            </tr>
          </thead>
          <tbody>
            {voteLogs.map((v: VoteLogItemDto, idx: number) => (
              <tr key={`${v.votedAt}-${v.teamName}-${idx}`} className="border-b last:border-b-0">
                <td className="px-6 py-4">{formatDateTimeKorean(new Date(v.votedAt))}</td>
                <td className="px-6 py-4">{v.teamName}</td>
                <td className="px-6 py-4">{v.voterName}</td>
                <td className="px-6 py-4">{v.voterEmail ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VoteLogTable;
