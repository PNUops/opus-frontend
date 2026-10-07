import dayjs from 'dayjs';
import { AiOutlineNotification } from 'react-icons/ai';
import { MdFiberNew } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { NoticeListDto } from '@dto/noticeDto';

type NoticeListVariant = 'card' | 'document';

interface NoticeListProps extends React.ComponentProps<'ul'> {
  variant?: NoticeListVariant;
}

export const NoticeList = ({ children, variant = 'card', className = '', ...props }: NoticeListProps) => {
  const variantClassName =
    variant === 'document'
      ? 'border-lightGray divide-lightGray divide-y border-b'
      : 'flex flex-col gap-1 rounded-xl bg-gray-50 p-2.5 shadow-md';

  return (
    <ul className={`${variantClassName} ${className}`.trim()} {...props}>
      {children}
    </ul>
  );
};

interface NoticeListItemProps extends NoticeListDto {
  contestId?: number;
  variant?: NoticeListVariant;
}

export const NoticeListItem = ({ title, noticeId, createdAt, contestId, variant = 'card' }: NoticeListItemProps) => {
  const showNewIcon = dayjs(createdAt).isAfter(dayjs().subtract(3, 'day'));
  const href = `/notices/${!contestId ? noticeId : `${contestId}/${noticeId}`}`;

  if (variant === 'document') {
    return (
      <li>
        <Link
          to={href}
          className="group focus-visible:ring-mainBlue grid min-h-20 grid-cols-1 gap-2 px-1 py-5 transition-colors hover:bg-gray-50 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:px-3"
        >
          <div className="flex min-w-0 items-start gap-2">
            <span className="group-hover:text-mainBlue text-sm leading-6 font-semibold [overflow-wrap:anywhere] text-neutral-800 transition-colors sm:text-base">
              {title}
            </span>
            {showNewIcon && <MdFiberNew aria-label="새 공지" className="text-mainRed mt-0.5 shrink-0 text-xl" />}
          </div>
          <time dateTime={createdAt} className="text-midGray text-xs whitespace-nowrap sm:text-sm">
            {dayjs(createdAt).format('YYYY.MM.DD ')}
          </time>
        </Link>
      </li>
    );
  }

  return (
    <li key={noticeId}>
      <Link
        to={href}
        className="group flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-black/5"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <AiOutlineNotification className="text-midGray shrink-0 text-lg group-hover:text-black" />
          <div className="flex min-w-0 items-center gap-1">
            <span className="truncate text-sm font-medium text-gray-700 group-hover:text-black sm:text-base">
              {title}
            </span>
            {showNewIcon && <MdFiberNew className="text-mainRed shrink-0 text-xl" />}
          </div>
        </div>
        <span className="text-midGray ml-4 shrink-0 text-xs whitespace-nowrap sm:text-sm">
          {dayjs(createdAt).format('YYYY-MM-DD HH:mm')}
        </span>
      </Link>
    </li>
  );
};

export const NoticeListNoData = ({ variant = 'card' }: { variant?: NoticeListVariant }) => (
  <li className={`text-midGray text-center ${variant === 'document' ? 'py-16' : 'py-2'}`}>
    등록된 공지사항이 없습니다.
  </li>
);

export const NoticeListSkeleton = ({ variant = 'card' }: { variant?: NoticeListVariant }) => {
  if (variant === 'document') {
    return (
      <ul className="border-lightGray divide-lightGray animate-pulse divide-y border-b" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, index) => (
          <li
            key={index}
            className="grid min-h-20 grid-cols-1 gap-3 px-1 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6 sm:px-3"
          >
            <div className="bg-lightGray h-5 w-full max-w-xl rounded-sm" />
            <div className="bg-lightGray h-4 w-28 rounded-sm" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="animate-pulse rounded-xl bg-white px-5 py-2.5 shadow-md">
      <ul className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <li key={index} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="mb-2 h-5 w-3/4 rounded bg-gray-200"></div>
            </div>
            <div className="ml-4 h-3 w-20 rounded bg-gray-200"></div>
          </li>
        ))}
      </ul>
    </div>
  );
};
