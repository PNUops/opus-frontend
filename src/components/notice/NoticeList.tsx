import dayjs from 'dayjs';
import { AiOutlineNotification } from 'react-icons/ai';
import { MdFiberNew } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { NoticeListDto } from '@dto/noticeDto';

export const NoticeList = ({ children }: React.ComponentProps<'ul'>) => {
  return <ul className="flex flex-col gap-1 rounded-xl bg-gray-50 p-2.5 shadow-md">{children}</ul>;
};

interface NoticeListItemProps extends NoticeListDto {
  contestId?: number;
}

export const NoticeListItem = ({ title, noticeId, createdAt, contestId }: NoticeListItemProps) => {
  const showNewIcon = dayjs(createdAt).isAfter(dayjs().subtract(3, 'day'));

  return (
    <li key={noticeId}>
      <Link
        to={`/notices/${!contestId ? noticeId : `${contestId}/${noticeId}`}`}
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

export const NoticeListNoData = () => <li className="text-midGray py-2 text-center">등록된 공지사항이 없습니다.</li>;

export const NoticeListSkeleton = () => {
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
