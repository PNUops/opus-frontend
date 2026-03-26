import { useQuery } from '@tanstack/react-query';
import { MyPageSection } from '@pages/me/mypageSection';
import { FaChevronLeft, FaChevronRight, FaChevronDown, FaCheck } from 'react-icons/fa6';
import { TbReload } from 'react-icons/tb';
import useFilterQuery from '../hooks/useFilterQueryData';
import { getDateRange } from '../utils/date';
import { inferDateType } from '../utils/filter';
import { useState } from 'react';
import { FaRegCommentAlt } from 'react-icons/fa';
import { mockMyCommentsContent } from '@mocks/data/me';

type MyComment = {
  comment: {
    memberName: string;
    commentId: number;
    content: string;
    createdAt: string;
  };
  project: {
    contestId: number;
    contestName: string;
    categoryName: string;
    trackName: string;
    teamId: number;
    teamName: string;
    projectName: string;
    overview: string;
  };
};
type MyCommentResponse = {
  content: MyComment[];
  totalPages: number;
  currentPage: number;
};

const MyCommentPage = () => {
  const [filter, setFilter] = useState({
    sort: 'latest',
    startDate: '',
    endDate: '',
    page: 0,
    size: 10,
  });

  const { SORT_OPTIONS, DATE_OPTIONS } = useFilterQuery();

  const { data } = useQuery<MyCommentResponse>({
    queryKey: ['myComments', filter],
    queryFn: () => Promise.resolve(mockMyCommentsContent(filter)),
  });

  const { content = [], totalPages = 0, currentPage = 0 } = data || {};

  const handleFilterChange = (next: Partial<typeof filter>) => {
    setFilter((prev) => ({ ...prev, ...next, page: 0 }));
  };
  const handleReset = () => {
    setFilter({ sort: 'latest', startDate: '', endDate: '', page: 0, size: 10 });
  };

  const dateType = inferDateType(filter.startDate, filter.endDate);

  return (
    <MyPageSection.Root>
      <MyPageSection.Header>
        <FaRegCommentAlt className="text-mainGreen size-5" />
        <p>내가 쓴 댓글</p>
      </MyPageSection.Header>
      <MyPageSection.Body>
        <div className="mb-10 flex w-full flex-wrap items-center justify-start gap-4 md:flex-row">
          <FilterDropDown
            label={SORT_OPTIONS.find((opt) => opt.value === (filter.sort || 'latest'))?.label ?? SORT_OPTIONS[0].label}
            value={filter.sort || 'latest'}
            options={SORT_OPTIONS}
            onChange={(v) => handleFilterChange({ sort: v })}
          />
          <FilterDropDown
            label={DATE_OPTIONS.find((opt) => opt.value === dateType)?.label ?? DATE_OPTIONS[0].label}
            value={dateType}
            options={DATE_OPTIONS}
            onChange={(v) => {
              if (!v) {
                handleFilterChange({ startDate: '', endDate: '' });
                return;
              }
              const range = getDateRange(v as '1m' | '3m');
              handleFilterChange({ ...range });
            }}
          />
          <button onClick={handleReset} className="hover:bg-lightGray bg-whiteGray rounded-sm p-1 transition-colors">
            <TbReload className="size-4" />
          </button>
        </div>
        <MyCommentGrid
          comments={content}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={(p) => setFilter((prev) => ({ ...prev, page: p }))}
        />
      </MyPageSection.Body>
    </MyPageSection.Root>
  );
};

export default MyCommentPage;

type Option<T extends string = string> = {
  label: string;
  value: T;
};
const FilterDropDown = <T extends string = string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const safeValue = value ?? '';
  const safeOptions = options && options.length > 0 ? options : [{ label: '', value: '' as T }];
  const isActive = safeValue !== '' && safeValue !== safeOptions[0].value;
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

const MyCommentGrid = ({
  comments,
  totalPages,
  currentPage,
  onPageChange,
}: {
  comments: MyComment[];
  totalPages: number;
  currentPage: number;
  onPageChange: (p: number) => void;
}) => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex w-full flex-col gap-4">
        {comments.map((item, idx) => (
          <MyCommentCard key={item.comment.commentId || idx} comment={item.comment} project={item.project} />
        ))}
      </div>
      {totalPages > 1 && (
        <MyCommentPagination totalPages={totalPages} currentPage={currentPage} onPageChange={onPageChange} />
      )}
    </div>
  );
};

const MyCommentCard = ({ comment, project }: { comment: MyComment['comment']; project: MyComment['project'] }) => {
  return (
    <div className="flex flex-col gap-2 rounded-md border bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="text-mainBlue font-semibold">{comment.memberName}</span>
        <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="text-sm text-gray-800">{comment.content}</div>
      <div className="mt-2 text-xs text-gray-500">
        <span className="font-medium">{project.projectName}</span> | {project.contestName} | {project.categoryName} |{' '}
        {project.trackName}
      </div>
      <div className="truncate text-xs text-gray-400">{project.overview}</div>
    </div>
  );
};

const MyCommentPagination = ({
  totalPages,
  currentPage,
  onPageChange,
}: {
  totalPages: number;
  currentPage: number;
  onPageChange: (p: number) => void;
}) => {
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
