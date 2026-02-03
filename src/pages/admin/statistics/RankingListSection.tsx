import { useQuery } from '@tanstack/react-query';
import { getLikeRanking } from 'apis/contests';
import { defaultRankFilter } from 'constants/statistics';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { RankingDto } from 'types/DTO/contestsDto';

const trackBadgeClass = (track?: string) => {
  switch (track) {
    case '분과 A':
      return 'bg-yellow-400 text-white';
    case '분과 B':
      return 'bg-sky-400 text-white';
    case '분과 C':
      return 'bg-rose-300 text-white';
    case '분과 D':
      return 'bg-emerald-400 text-white';
    default:
      return 'bg-gray-200 text-gray-700';
  }
};

const trackHeaderBg = (track?: string) => {
  switch (track) {
    case '분과 A':
      return 'bg-yellow-50';
    case '분과 B':
      return 'bg-sky-50';
    case '분과 C':
      return 'bg-rose-50';
    case '분과 D':
      return 'bg-emerald-50';
    default:
      return 'bg-gray-50';
  }
};

const RankingListSection = () => {
  const { contestId } = useParams();
  const [selectedFilter, setSelectedFilter] = useState<string>(defaultRankFilter[0]);

  const { data: likeRanking } = useQuery({
    queryKey: ['likeRanking', contestId],
    queryFn: () => getLikeRanking(Number(contestId ?? 0)),
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
      return likeRanking.reduce<Record<string, RankingDto[]>>((acc, item) => {
        const key = item.trackName;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});
    } else return likeRanking.filter((r) => r.trackName === selectedFilter);
  }, [likeRanking, selectedFilter]);

  return (
    <section>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">투표 순위</h2>
          <p className="text-sm text-gray-500">순위, 팀명, 프로젝트명, 분과</p>
        </div>
        <div>
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="ml-4 rounded border border-gray-200 bg-white px-3 py-2 text-sm"
            aria-label="분과 필터"
          >
            {filters.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>
      {Array.isArray(rankingList) ? (
        <RankingList list={rankingList} />
      ) : (
        <div className="mb-4">
          {Object.entries(rankingList).map(([track, list]) => (
            <>
              <div className={`${trackHeaderBg(track)} rounded p-4`}>
                <span
                  className={`inline-flex items-center justify-center rounded-full px-3 py-[6px] text-xs ${trackBadgeClass(track)}`}
                >
                  {track}
                </span>
              </div>
              <RankingList list={list} />
            </>
          ))}
        </div>
      )}
      {!rankingList.length && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500">
          랭킹 데이터가 없습니다.
        </div>
      )}
    </section>
  );
};

const RankingList = ({ list }: { list: RankingDto[] }) => {
  return (
    <div className="rounded-lg border border-gray-100 bg-white">
      <ul>
        {list.map((item) => (
          <li
            key={item.teamId}
            className="flex items-center justify-between border-b border-gray-200 px-6 py-4 last:border-b-0"
          >
            <div className="flex items-center gap-6">
              <div className="w-8 text-center text-sm text-gray-700">{item.rank}</div>
              <div className="min-w-[110px] text-sm text-gray-800">{item.teamName}</div>
              <div className="min-w-[240px] text-sm text-gray-700">{item.projectName}</div>
              <div>
                <span
                  className={`inline-flex items-center justify-center rounded-full px-3 py-[6px] text-xs ${trackBadgeClass(
                    item.trackName,
                  )}`}
                >
                  {item.trackName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-red-500">
              <svg className="h-5 w-5 fill-current text-red-500" viewBox="0 0 24 24">
                <path d="M12 21s-7-4.35-9.17-6.22C1.78 12.85 2 9.5 4.5 7.5 6.03 6 8.1 6 9.5 6 10.9 6 12 7 12 7s1.1-1 2.5-1c1.4 0 3.47 0 5 1 2.5 2 2.72 5.35 1.67 7.28C19 16.65 12 21 12 21z" />
              </svg>
              <div className="text-sm font-semibold text-gray-800">
                {item.likeCount.toLocaleString()}
                <span className="ml-1 text-sm text-gray-500">개</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RankingListSection;
