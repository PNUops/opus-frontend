import { AiOutlineNotification } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { MdFiberNew } from 'react-icons/md';
import dayjs from 'dayjs';
import { useSuspenseQuery } from '@tanstack/react-query';
import { noticeOption } from 'queries/notices';

const NoticeList = () => {
  const { data: notices } = useSuspenseQuery(noticeOption());

  return (
    <div className="rounded-xl bg-gray-50 p-2.5 shadow-md">
      <ul className="flex flex-col gap-1">
        {notices.length === 0 && <li className="text-midGray py-2 text-center text-sm">등록된 공지사항이 없습니다.</li>}
        {notices.map((notice) => {
          const showNewIcon = dayjs(notice.createdAt).isAfter(dayjs().subtract(3, 'day'));
          return (
            <li key={notice.noticeId}>
              <Link
                to={`/notices/${notice.noticeId}`}
                className="group flex items-center justify-between rounded-md px-2 py-2 transition-colors hover:bg-black/5"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <AiOutlineNotification className="text-midGray shrink-0 text-lg group-hover:text-black" />
                  <div className="flex min-w-0 items-center gap-1">
                    <span className="truncate text-sm font-medium text-gray-700 group-hover:text-black sm:text-base">
                      {notice.title}
                    </span>
                    {showNewIcon && <MdFiberNew className="text-mainRed shrink-0 text-xl" />}
                  </div>
                </div>
                <span className="text-midGray ml-4 shrink-0 text-xs whitespace-nowrap sm:text-sm">
                  {dayjs(notice.createdAt).format('YYYY-MM-DD HH:mm')}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default NoticeList;
