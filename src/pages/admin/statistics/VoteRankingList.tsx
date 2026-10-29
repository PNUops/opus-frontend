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
      <div className="lg:max-h-100 lg:overflow-y-auto">
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
    <ul>
      {list.map((item) => (
        <li
          key={item.teamName}
          className="border-lightGray grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b py-4 last:border-b-0 lg:flex lg:items-center lg:justify-between lg:px-5 lg:py-3"
        >
          <div className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)] gap-x-3 gap-y-2 lg:flex lg:items-center lg:gap-6">
            <div className="row-span-3 w-8 text-center text-sm text-gray-700" aria-label={`${item.rank}위`}>
              {item.rank}
            </div>
            <div className="min-w-0 text-sm break-words text-gray-800 lg:min-w-[110px]">{item.teamName}</div>
            <div className="min-w-0 text-sm break-words text-gray-700 lg:min-w-[240px]">{item.projectName}</div>
            <div className="flex min-w-0">{item.trackName && <TrackTag name={item.trackName} />}</div>
          </div>
          <div
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap"
            aria-label={`${item.voteCount.toLocaleString()}표`}
          >
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
