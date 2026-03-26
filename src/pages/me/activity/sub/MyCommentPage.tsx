import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import FilterDropDown from '@components/FilterDropDown';
import { MyPageSection } from '@pages/me/mypageSection';
import useFilterQuery from '@pages/me/activity/hooks/useFilterQueryData';
import { getDateRange } from '@pages/me/activity/utils/date';
import { inferDateType } from '@pages/me/activity/utils/filter';
import { FaRegCommentAlt } from 'react-icons/fa';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { TbReload } from 'react-icons/tb';
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
