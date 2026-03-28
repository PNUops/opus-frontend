import FilterDropDown from '@components/FilterDropDown';
import useFilterQuery from '@pages/me/activity/hooks/useFilterQueryData';
import { FilterState } from '@pages/me/activity/hooks/useMyActivityFilter';
import { getDateRange } from '@pages/me/activity/utils/date';
import { SortType } from '@pages/me/activity/types/filter';
import { useEffect, useMemo, useState } from 'react';
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
  const dateType = query.dateType;
  const selectedDate = DATE_OPTIONS.find((opt) => opt.value === dateType);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [customStartDate, setCustomStartDate] = useState(query.startDate || today);
  const [customEndDate, setCustomEndDate] = useState(query.endDate || today);

  useEffect(() => {
    if (dateType !== 'custom') return;
    setCustomStartDate(query.startDate || today);
    setCustomEndDate(query.endDate || today);
  }, [dateType, query.startDate, query.endDate, today]);

  return (
    <div className="mb-10 flex w-full flex-wrap items-center justify-start gap-4 md:flex-row">
      <FilterDropDown
        label={SORT_OPTIONS.find((opt) => opt.value === (query.sort || 'latest'))?.label ?? SORT_OPTIONS[0].label}
        value={query.sort || 'latest'}
        options={SORT_OPTIONS}
        onChange={(v) => onQueryChange({ sort: v as SortType, page: '0' })}
      />

      <div className="relative">
        <FilterDropDown
          label={selectedDate?.label ?? DATE_OPTIONS[0].label}
          value={dateType}
          options={DATE_OPTIONS}
          onChange={(v) => {
            if (!v) {
              onQueryChange({ dateType: '', startDate: '', endDate: '', page: '0' });
              return;
            }

            if (v === 'custom') {
              onQueryChange({ dateType: 'custom', startDate: '', endDate: '', page: '0' });
              return;
            }

            const range = getDateRange(v as '1m' | '3m');
            onQueryChange({ dateType: v, ...range, page: '0' });
          }}
        />

        {dateType === 'custom' && (
          <div className="border-lightGray bg-whiteGray absolute top-full left-0 z-20 mt-2 flex w-max items-end gap-2 rounded-sm border px-3 py-2 shadow-sm">
            <div className="flex flex-col gap-1">
              <label htmlFor="activity-custom-start-date" className="text-xs text-gray-600">
                시작일
              </label>
              <input
                id="activity-custom-start-date"
                type="date"
                value={customStartDate}
                max={customEndDate || undefined}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border-lightGray rounded-sm border bg-white px-2 py-1 text-sm"
              />
            </div>
            <span className="pb-2 text-gray-500">~</span>
            <div className="flex flex-col gap-1">
              <label htmlFor="activity-custom-end-date" className="text-xs text-gray-600">
                종료일
              </label>
              <input
                id="activity-custom-end-date"
                type="date"
                value={customEndDate}
                min={customStartDate || undefined}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border-lightGray rounded-sm border bg-white px-2 py-1 text-sm"
              />
            </div>
            <button
              type="button"
              className="bg-mainBlue rounded-sm px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-sky-800"
              onClick={() =>
                onQueryChange({
                  dateType: 'custom',
                  startDate: customStartDate,
                  endDate: customEndDate,
                  page: '0',
                })
              }
            >
              적용
            </button>
          </div>
        )}
      </div>

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
