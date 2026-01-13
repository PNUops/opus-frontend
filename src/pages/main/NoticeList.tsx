import { AiOutlineNotification } from 'react-icons/ai';
import { Link } from 'react-router-dom';
import { MdFiberNew } from 'react-icons/md';
import dayjs from 'dayjs';
import { NoticeListDto } from 'types/DTO/noticeDto';

interface Props {
  notices: NoticeListDto[];
}

const NoticeList = ({ notices }: Props) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <ul>
        {notices && notices.length === 0 && (
          <li className="text-midGray py-2 text-center text-sm">등록된 공지사항이 없습니다.</li>
        )}
        {notices?.map((notice) => {
          const showNewIcon = dayjs(notice.createdAt).isAfter(dayjs().subtract(3, 'day'));

          return (
            <Link
              to={`/notices/${notice.noticeId}`}
              key={notice.noticeId}
              className="hover:bg-lightGray flex items-center justify-between rounded px-2 py-1 transition"
            >
              <AiOutlineNotification className="mr-2" />
              <div className="flex flex-1 items-center gap-1 truncate">
                <div className="truncate text-[clamp(0.75rem,2vw,1rem)]">{notice.title} </div>
                {showNewIcon && <MdFiberNew className="text-mainRed shrink-0 text-[clamp(1rem,2vw,1.5rem)]" />}
              </div>

              <span className="text-midGray ml-2 truncate text-right text-xs">
                {dayjs(notice.createdAt).format('YYYY년 MM월 DD일 HH:mm')}
              </span>
            </Link>
          );
        })}
      </ul>
    </div>
  );
};

export default NoticeList;
