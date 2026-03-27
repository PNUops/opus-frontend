import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { MyPageSection } from '@pages/me/mypageSection';
import FilterDropDown from '@components/FilterDropDown';
import Pagination from '@components/Pagination';
import TeamCard from '@pages/main/TeamCard';
import useFilterQuery from '@pages/me/activity/hooks/useFilterQueryData';
import { FilterState, useMyLikesFilter } from '@pages/me/activity/hooks/useMyLikesFilter';
import { inferDateType } from '@pages/me/activity/utils/filter';
import { getDateRange } from '@pages/me/activity/utils/date';
import { getMyLikes } from 'apis/me';
import { GetMyLikesResponseDto } from 'types/DTO/meDto';
import { RiHeart3Line } from 'react-icons/ri';
import { TbReload } from 'react-icons/tb';

const MyLikeTab = () => {
  const { state, update, reset, apiParams, queryKey } = useMyLikesFilter();

  return (
    <MyPageSection.Root>
      <MyPageSection.Header>
        <RiHeart3Line className="text-mainRed size-6" />
        <p>좋아요</p>
      </MyPageSection.Header>
      <MyPageSection.Body>
        <MyLikeFilterBar query={state} onQueryClean={reset} onQueryChange={update} />
        <MyLikeGrid apiParams={apiParams} queryKey={queryKey} onPageChange={(page) => update({ page: String(page) })} />
      </MyPageSection.Body>
    </MyPageSection.Root>
  );
};

export default MyLikeTab;

interface MyLikeFilterBarProps {
  query: FilterState;
  onQueryChange: (next: Partial<FilterState>) => void;
  onQueryClean: () => void;
}
const MyLikeFilterBar = ({ query, onQueryChange, onQueryClean }: MyLikeFilterBarProps) => {
  const { SORT_OPTIONS, DATE_OPTIONS, CATEGORY_OPTIONS, CONTEST_OPTIONS } = useFilterQuery();
  const dateType = inferDateType(query.startDate, query.endDate);
  const selected = DATE_OPTIONS.find((opt) => opt.value === dateType);

  return (
    <div className="mb-10 flex w-full flex-wrap items-center justify-start gap-4 md:flex-row">
      <FilterDropDown
        label={SORT_OPTIONS.find((opt) => opt.value === (query.sort || 'latest'))?.label ?? SORT_OPTIONS[0].label}
        value={query.sort || 'latest'}
        options={SORT_OPTIONS}
        onChange={(v) => onQueryChange({ sort: v as 'latest' | 'oldest', page: '0' })}
      />
      <FilterDropDown
        label={selected?.label ?? DATE_OPTIONS[0].label}
        value={dateType}
        options={DATE_OPTIONS}
        onChange={(v) => {
          if (!v) {
            onQueryChange({ dateType: '', startDate: '', endDate: '', page: '0' });
            return;
          }
          const range = getDateRange(v as '1m' | '3m');
          onQueryChange({ ...range, page: '0' });
        }}
      />
      <FilterDropDown
        label={
          CATEGORY_OPTIONS.find((opt) => opt.value === (query.categoryId ? String(query.categoryId) : ''))?.label ??
          CATEGORY_OPTIONS[0].label
        }
        value={query.categoryId ? String(query.categoryId) : ''}
        options={CATEGORY_OPTIONS}
        onChange={(v) => onQueryChange({ categoryId: v })}
      />
      <FilterDropDown
        label={
          CONTEST_OPTIONS.find((opt) => opt.value === (query.contestId ? String(query.contestId) : ''))?.label ??
          CONTEST_OPTIONS[0].label
        }
        value={query.contestId ? String(query.contestId) : ''}
        options={CONTEST_OPTIONS}
        onChange={(v) => onQueryChange({ contestId: v })}
      />
      <button onClick={onQueryClean} className="hover:bg-lightGray bg-whiteGray rounded-sm p-1 transition-colors">
        <TbReload className="size-4" />
      </button>
    </div>
  );
};

const MyLikeGrid = ({
  apiParams,
  queryKey,
  onPageChange,
}: {
  apiParams: Parameters<typeof getMyLikes>[0];
  queryKey: ReturnType<typeof useMyLikesFilter>['queryKey'];
  onPageChange: (page: number) => void;
}) => {
  const { data: myLikes } = useQuery<GetMyLikesResponseDto>({
    queryKey: queryKey,
    queryFn: () => getMyLikes(apiParams),
    placeholderData: keepPreviousData,
  });

  const { content, totalPages, currentPage } = myLikes || {
    content: [],
    totalPages: 0,
    currentPage: 0,
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {content?.map((proj) => (
          <TeamCard
            key={proj.teamId}
            contestId={proj.contestId}
            teamId={proj.teamId}
            teamName={proj.teamName}
            projectName={proj.projectName}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage + 1}
          onPageChange={(page) => onPageChange(page - 1)}
        />
      )}
    </div>
  );
};
