import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaVoteYea } from 'react-icons/fa';
import { getVoteRanking } from 'apis/statistics';
import { defaultRankFilter } from 'constants/statistics';
import { getColorClassForLabel } from 'utils/color';
import Select from '@components/Select';
import Tag from '@components/Tag';
import { VoteRankingDto } from 'types/DTO';

const VoteRankingSection = () => {
  const { contestId } = useParams();
  const [selectedFilter, setSelectedFilter] = useState<string>(defaultRankFilter[0]);

  const { data: likeRanking } = useQuery({
    queryKey: ['likeRanking', contestId],
    queryFn: () => getVoteRanking(Number(contestId ?? 0)),
    enabled: !!contestId,
  });

  const filters = useMemo(() => {
    if (!likeRanking) return defaultRankFilter;
    const uniq = Array.from(new Set(likeRanking.map((r) => r.trackName)));
    return [...defaultRankFilter, ...uniq];
  }, [likeRanking]);

  const rankingList = useMemo(() => {
    if (!likeRanking || likeRanking.length === 0) return [];
    if (selectedFilter === '전체') return likeRanking;
    else if (selectedFilter === '분과별 묶어보기') {
      return likeRanking.reduce<Record<string, VoteRankingDto[]>>((acc, item) => {
        const key = item.trackName;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});
    } else return likeRanking.filter((r) => r.trackName === selectedFilter);
  }, [likeRanking, selectedFilter]);

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-end gap-4">
          <h2 className="text-2xl font-bold">투표 순위</h2>
          <p className="text-midGray">순위, 팀명, 프로젝트명, 분과, 투표 수</p>
        </div>
        <div>
          <Select value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} aria-label="분과 필터">
            {filters.map((filter) => (
              <option key={filter} value={filter}>
                {filter}
              </option>
            ))}
          </Select>
        </div>
      </div>
      {Array.isArray(rankingList) ? (
        <RankingList list={rankingList} />
      ) : (
        Object.entries(rankingList).map(([track, list]) => {
          const trackColorClass = useMemo(() => getColorClassForLabel(track), [track]);
          return (
            <div className="border-lightGray border-b" key={track}>
              <div className={`${trackColorClass} rounded px-4 py-2 backdrop-brightness-80`}>
                <span className={'inline-flex font-semibold'}>{track}</span>
              </div>
              <RankingList list={list} />
            </div>
          );
        })
      )}
      {rankingList.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
          랭킹 데이터가 없습니다.
        </div>
      )}
    </section>
  );
};

export interface RankingListProps {
  list: VoteRankingDto[];
}

const RankingList = ({ list }: RankingListProps) => {
  return (
    <ul>
      {list.map((item) => (
        <li
          key={item.teamName}
          className="border-lightGray flex items-center justify-between border-b px-5 py-3 last:border-b-0"
        >
          <div className="flex items-center gap-6">
            <div className="w-8 text-center text-sm text-gray-700">{item.rank}</div>
            <div className="min-w-[110px] text-sm text-gray-800">{item.teamName}</div>
            <div className="min-w-[240px] text-sm text-gray-700">{item.projectName}</div>
            <div>
              <TrackTag name={item.trackName} />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <FaVoteYea className="fill-mainGreen mt-0.5" size={22} />
            <div className="text-mainGreen text-sm font-semibold">{`${item.likeCount.toLocaleString()}개`}</div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default VoteRankingSection;

// TODO: 추후 feature/track 폴더로 분과 태그 컴포넌트 관리
const TrackTag = ({ name }: { name: string }) => {
  const colorClass = getColorClassForLabel(name);
  return <Tag className={colorClass}>{name}</Tag>;
};
