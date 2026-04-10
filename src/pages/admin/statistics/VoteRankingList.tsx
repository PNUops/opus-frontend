import { useMemo } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { FaVoteYea } from 'react-icons/fa';
import Tag from '@components/Tag';
import { NoData } from '@components/NoData';
import { useContestIdOrRedirect } from '@hooks/useId';
import { voteRankingOption } from '@queries/statistics';
import { VoteRankingDto } from '@dto/statisticsDto';
import { getColorClassForLabel } from '@utils/color';

interface VoteRankingListProps {
  selectedFilter: string;
}

const VoteRankingList = ({ selectedFilter }: VoteRankingListProps) => {
  const contestId = useContestIdOrRedirect();
  const { data: voteRanking } = useSuspenseQuery(voteRankingOption(contestId));

  const rankingList = useMemo(() => {
    if (!voteRanking || voteRanking.length === 0) return [];
    if (selectedFilter === '전체') return voteRanking;
    else if (selectedFilter === '분과별 묶어보기') {
      return voteRanking.reduce<Record<string, VoteRankingDto[]>>((acc, item) => {
        const key = item.trackName;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});
    } else return voteRanking.filter((r) => r.trackName === selectedFilter);
  }, [voteRanking, selectedFilter]);

  if (voteRanking.length === 0) return <NoData className="h-30" />;
  else {
    return (
      <div className="max-h-100 overflow-y-auto">
        {Array.isArray(rankingList) ? (
          <RankingList list={rankingList} />
        ) : (
          Object.entries(rankingList).map(([track, list]) => {
            const trackColorClass = getColorClassForLabel(track);
            return (
              <div className="border-lightGray mb-4 border-b" key={track}>
                <div className={`${trackColorClass} rounded px-4 py-2 backdrop-brightness-80`}>
                  <span className={'inline-flex font-semibold'}>{track}</span>
                </div>
                <RankingList list={list} />
              </div>
            );
          })
        )}
      </div>
    );
  }
};

export default VoteRankingList;

interface RankingListProps {
  list: VoteRankingDto[];
}

const RankingList = ({ list }: RankingListProps) => {
  return (
    <ul className="max-h-100 overflow-y-auto">
      {list.map((item) => (
        <li
          key={item.teamName}
          className="border-lightGray flex items-center justify-between border-b px-5 py-3 last:border-b-0"
        >
          <div className="flex items-center gap-6">
            <div className="w-8 text-center text-sm text-gray-700">{item.rank}</div>
            <div className="min-w-[110px] text-sm text-gray-800">{item.teamName}</div>
            <div className="min-w-[240px] text-sm text-gray-700">{item.projectName}</div>
            <div>{item.trackName && <TrackTag name={item.trackName} />}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <FaVoteYea className="fill-mainGreen mt-0.5" size={22} />
            <div className="text-mainGreen text-sm font-semibold">{`${item.voteCount.toLocaleString()}개`}</div>
          </div>
        </li>
      ))}
    </ul>
  );
};

// TODO: 추후 feature/track 폴더로 분과 태그 컴포넌트 관리
const TrackTag = ({ name }: { name: string }) => {
  const colorClass = getColorClassForLabel(name);
  return <Tag className={colorClass}>{name}</Tag>;
};
