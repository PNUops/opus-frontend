import { useId, useState } from 'react';
import type { VoteReportRankingDto } from '@dto/voteReportDto';
import { cn } from '@utils/classname';

const RankingItem = ({ item }: { item: VoteReportRankingDto }) => {
  const [expanded, setExpanded] = useState(false);
  const namesId = useId();
  const trackId = useId();
  const teamName = item.teamName?.trim() || '팀명 미등록';
  const projectName = item.projectName?.trim() || '프로젝트명 미등록';
  const hasLongName = teamName.length > 30 || projectName.length > 50 || (item.trackName?.length ?? 0) > 30;
  const collapsed = hasLongName && !expanded;
  return (
    <li className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 py-5 sm:grid-cols-[3rem_minmax(0,1fr)_minmax(6rem,0.5fr)_5rem] sm:items-center sm:gap-x-5">
      <span
        aria-label={`${item.rank}위`}
        className="pt-0.5 text-center text-base font-medium text-neutral-700 tabular-nums"
      >
        {item.rank}
      </span>
      <div id={namesId} className="min-w-0">
        <p className={cn('text-sm leading-6 font-medium break-words text-neutral-900', collapsed && 'line-clamp-2')}>
          {teamName}
        </p>
        <p className={cn('mt-1 text-sm leading-6 break-words text-neutral-600', collapsed && 'line-clamp-2')}>
          {projectName}
        </p>
      </div>
      <p
        id={trackId}
        className={cn(
          'col-start-2 row-start-2 text-xs leading-5 break-words text-neutral-600 sm:col-start-auto sm:row-start-auto sm:text-sm',
          collapsed && 'line-clamp-2',
        )}
      >
        {item.trackName ?? '분과 미지정'}
      </p>
      <p className="text-mainBlue col-start-3 row-start-1 pt-0.5 text-right text-sm leading-6 font-medium whitespace-nowrap tabular-nums sm:col-start-auto sm:row-start-auto">
        {item.voteCount.toLocaleString('ko-KR')}표
      </p>
      {hasLongName && (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={`${namesId} ${trackId}`}
          onClick={() => setExpanded((value) => !value)}
          className="text-mainBlue focus-visible:outline-mainBlue col-start-2 row-start-3 min-h-11 justify-self-start text-left text-xs underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 sm:row-start-2"
        >
          {expanded ? '이름 접기' : '전체 이름 보기'}
        </button>
      )}
    </li>
  );
};

const RankingList = ({ rankings }: { rankings: VoteReportRankingDto[] }) => (
  <ol aria-label="팀별 투표 순위" className="border-lightGray divide-lightGray divide-y border-y">
    {rankings.map((item) => (
      <RankingItem key={item.teamId} item={item} />
    ))}
  </ol>
);

const VoteRankingList = ({
  selectedFilter,
  rankings,
}: {
  selectedFilter: string;
  rankings: VoteReportRankingDto[];
}) => {
  if (!rankings.length)
    return <p className="border-lightGray border-y py-12 text-center text-sm text-neutral-600">등록된 팀이 없어요.</p>;
  if (selectedFilter === 'grouped') {
    const groups = new Map<string | null, VoteReportRankingDto[]>();
    rankings.forEach((item) => {
      const group = groups.get(item.trackName);
      if (group) group.push(item);
      else groups.set(item.trackName, [item]);
    });
    return (
      <div className="flex flex-col gap-8">
        {Array.from(groups, ([track, items]) => (
          <section key={JSON.stringify(track)} className="min-w-0">
            <h3 className="mb-3 text-sm font-medium break-words text-neutral-700">{track ?? '분과 미지정'}</h3>
            <RankingList rankings={items} />
          </section>
        ))}
      </div>
    );
  }
  return (
    <RankingList
      rankings={
        selectedFilter === 'all'
          ? rankings
          : rankings.filter((item) => `track:${JSON.stringify(item.trackName)}` === selectedFilter)
      }
    />
  );
};

export default VoteRankingList;
