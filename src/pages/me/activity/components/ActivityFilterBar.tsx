import FilterDropDown from '@components/FilterDropDown';
import useFilterQuery from '@pages/me/activity/hooks/useFilterQueryData';
import { FilterState } from '@pages/me/activity/hooks/useMyActivityFilter';
import { getDateRange } from '@pages/me/activity/utils/date';
import { inferDateType } from '@pages/me/activity/utils/filter';
import { SortType } from '@pages/me/activity/types/filter';
import { TbReload } from 'react-icons/tb';

interface ActivityFilterBarProps {
  query: FilterState;
  onQueryChange: (next: Partial<FilterState>) => void;
  onQueryReset: () => void;
  showCategory?: boolean;
  showContest?: boolean;
}

const ActivityFilterBar = ({
  query,
  onQueryChange,
  onQueryReset,
  showCategory = false,
  showContest = false,
}: ActivityFilterBarProps) => {
  const { SORT_OPTIONS, DATE_OPTIONS, CATEGORY_OPTIONS, CONTEST_OPTIONS } = useFilterQuery();
  const dateType = inferDateType(query.startDate, query.endDate);
  const selectedDate = DATE_OPTIONS.find((opt) => opt.value === dateType);

  return (
    <div className="mb-10 flex w-full flex-wrap items-center justify-start gap-4 md:flex-row">
      <FilterDropDown
        label={SORT_OPTIONS.find((opt) => opt.value === (query.sort || 'latest'))?.label ?? SORT_OPTIONS[0].label}
        value={query.sort || 'latest'}
        options={SORT_OPTIONS}
        onChange={(v) => onQueryChange({ sort: v as SortType, page: '0' })}
      />

      <FilterDropDown
        label={selectedDate?.label ?? DATE_OPTIONS[0].label}
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

      {showCategory && (
        <FilterDropDown
          label={
            CATEGORY_OPTIONS.find((opt) => opt.value === (query.categoryId ? String(query.categoryId) : ''))?.label ??
            CATEGORY_OPTIONS[0].label
          }
          value={query.categoryId ? String(query.categoryId) : ''}
          options={CATEGORY_OPTIONS}
          onChange={(v) => onQueryChange({ categoryId: v, page: '0' })}
        />
      )}

      {showContest && (
        <FilterDropDown
          label={
            CONTEST_OPTIONS.find((opt) => opt.value === (query.contestId ? String(query.contestId) : ''))?.label ??
            CONTEST_OPTIONS[0].label
          }
          value={query.contestId ? String(query.contestId) : ''}
          options={CONTEST_OPTIONS}
          onChange={(v) => onQueryChange({ contestId: v, page: '0' })}
        />
      )}

      <button onClick={onQueryReset} className="hover:bg-lightGray bg-whiteGray rounded-sm p-1 transition-colors">
        <TbReload className="size-4" />
      </button>
    </div>
  );
};

export default ActivityFilterBar;
