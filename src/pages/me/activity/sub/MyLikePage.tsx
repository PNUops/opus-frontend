import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ActivitySection } from '@pages/me/activity/ActivityPage';
import { RiHeart3Line } from 'react-icons/ri';
import { FaChevronLeft, FaChevronRight, FaChevronDown, FaCheck } from 'react-icons/fa6';
import TeamCard from '@pages/main/TeamCard';
import { GetMyLikesResponseDto, MyLikeDto } from 'types/DTO/meDto';
import { getMyLikes } from 'apis/me';
import useFilterQuery from '../hooks/useFilterQueryData';
import { inferDateType } from '../utils/filter';
import { getDateRange } from '../utils/date';
import { TbReload } from 'react-icons/tb';
import { FilterState, useMyLikesFilter } from '../hooks/useMyLikesFilter';

const MyLikeTab = () => {
  const { state, update, reset, apiParams, queryKey } = useMyLikesFilter();

  const { data: myLikes } = useQuery<GetMyLikesResponseDto>({
    queryKey: queryKey,
    queryFn: () => getMyLikes(apiParams),
    placeholderData: keepPreviousData,
  });

  const { content, totalElements, totalPages, currentPage, size } = myLikes || {
    content: [],
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    size: 0,
  };

  return (
    <ActivitySection.Root>
      <ActivitySection.Header>
        <RiHeart3Line className="text-mainRed size-6" />
        <p>좋아요</p>
      </ActivitySection.Header>
      <ActivitySection.Body>
        <MyLikeFilterBar query={state} onQueryClean={reset} onQueryChange={update} />
        <MyLikeGrid
          projects={content}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={(p) => update({ page: String(p) })}
        />
      </ActivitySection.Body>
    </ActivitySection.Root>
  );
};

export default MyLikeTab;

type FilterOption = {
  label: string;
  value: string;
};

interface FilterDropDownProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

const FilterDropDown = ({ label, value, options, onChange }: FilterDropDownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const safeValue = value ?? '';
  const safeOptions = options && options.length > 0 ? options : [{ label: '', value: '' }];
  const isActive = safeValue !== '' && safeValue !== safeOptions[0].value;

  console.log('FilterDropDown Rendered with value:', value);
  return (
    <div className="relative flex w-fit flex-col">
      <button
        className={`${isActive ? 'bg-mainBlue text-white hover:bg-sky-800' : 'bg-whiteGray hover:bg-lightGray text-black'} flex w-fit items-center gap-1 rounded-sm px-2 py-1 text-sm font-medium transition-colors`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <p className="max-w-30 overflow-hidden text-ellipsis whitespace-nowrap">{label}</p>
        <FaChevronDown className="size-3" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 z-10 mt-1">
          <div className="bg-whiteGray flex flex-col items-start gap-1 rounded-sm p-2">
            {safeOptions.map((opt, idx) => {
              const isChecked = (safeValue === '' && opt.value === '' && idx === 0) || opt.value === safeValue;
              return (
                <button
                  key={opt.value}
                  className="hover:bg-lightGray flex w-full items-center gap-2 rounded-sm px-2 py-1 text-left text-sm whitespace-nowrap"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  {isChecked && <FaCheck className="size-3" />}
                  <p className="w-full text-right">{opt.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

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
  projects,
  totalPages,
  currentPage,
  onPageChange,
}: {
  projects: MyLikeDto[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <div className="flex flex-col items-center">
      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {projects?.map((proj) => (
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
        <MyLikeGridPagination totalPages={totalPages} currentPage={currentPage} onPageChange={onPageChange} />
      )}
    </div>
  );
};

interface MyLikeGridPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const MyLikeGridPagination = ({ totalPages, currentPage, onPageChange }: MyLikeGridPaginationProps) => {
  return (
    <div className="flex w-full max-w-65 items-center justify-between gap-4 py-4">
      <button
        disabled={currentPage <= 0}
        onClick={() => onPageChange(currentPage - 1)}
        className={`rounded-sm border border-transparent p-1 transition-all duration-200 ${
          currentPage <= 0 ? 'cursor-auto opacity-10' : 'hover:border-lightGray'
        }`}
      >
        <FaChevronLeft className="size-4" />
      </button>
      <div className="flex flex-1 items-center justify-center gap-2">
        {(() => {
          const maxButtons = 5;
          const half = Math.floor(maxButtons / 2);
          const start = Math.max(0, Math.min(currentPage - half, Math.max(0, totalPages - maxButtons)));
          const end = Math.min(totalPages, start + maxButtons);
          return Array.from({ length: end - start }, (_, i) => {
            const page = start + i;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`p-1 transition-all duration-200 hover:text-black ${currentPage === page ? 'font-medium text-black' : 'text-lightGray'}`}
              >
                {page + 1}
              </button>
            );
          });
        })()}
      </div>
      <button
        disabled={currentPage >= totalPages - 1}
        onClick={() => onPageChange(currentPage + 1)}
        className={`rounded-sm border border-transparent p-1 transition-all duration-200 ${
          currentPage >= totalPages - 1 ? 'cursor-auto opacity-10' : 'hover:border-lightGray'
        }`}
      >
        <FaChevronRight className="size-4" />
      </button>
    </div>
  );
};
