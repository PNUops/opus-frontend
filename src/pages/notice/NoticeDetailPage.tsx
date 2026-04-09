import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { AiOutlineNotification } from 'react-icons/ai';
import { useContestId, useNoticeIdOrRedirect } from '@hooks/useId';
import { contestNoticeDetailOption, noticeDetailOption } from '@queries/notices';
import NoticeDetailSkeleton from './NoticeDetailSkeleton';
import useContestName from '@hooks/useContestName';
import { Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const NoticeDetail = () => {
  const noticeId = useNoticeIdOrRedirect();
  const contestId = useContestId();
  const contestName = useContestName();

  const {
    data: notice,
    isLoading,
    isError,
  } = useQuery(!contestId ? noticeDetailOption(noticeId) : contestNoticeDetailOption(contestId, noticeId));

  if (isLoading) return <NoticeDetailSkeleton />;
  if (isError || !notice) return <div>공지사항 조회 중 오류가 발생했습니다.</div>;

  return (
    <div className="max-w mx-auto">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <Link to={!contestId ? '/' : `/contest/${contestId}`} title={`${contestName ?? '메인으'}로 돌아가기`}>
          <Undo2 className="shrink-0 cursor-pointer" />
        </Link>
        {`${contestName ?? ''} 공지사항`.trim()}
      </h1>
      <div className="bg-whiteGray mb-2 flex items-center rounded px-4 py-5">
        <AiOutlineNotification className="mr-4" />
        <span className="flex-1 text-[clamp(0.85rem,2vw,1.3rem)] font-bold">{notice.title}</span>
      </div>
      <div className="flex justify-end">
        <div className="flex px-2">
          <div className="text-midGray px-2 text-[clamp(0.75rem,1.5vw,1rem)]">작성일</div>
          <div className="text-midGray mb-6 text-right text-[clamp(0.75rem,1.5vw,1rem)] font-semibold">
            {dayjs(notice.createdAt).format('YYYY.MM.DD')}
          </div>
        </div>

        <div className="text-midGray px-1 text-[clamp(0.75rem,1.5vw,1rem)] font-bold"> |</div>

        <div className="flex">
          <div className="text-midGray px-2 text-[clamp(0.75rem,1.5vw,1rem)]">수정일</div>
          <div className="text-midGray mb-6 text-right text-[clamp(0.75rem,1.5vw,1rem)] font-semibold">
            {dayjs(notice.updatedAt).format('YYYY.MM.DD')}
          </div>
        </div>
      </div>

      <p className="bg-subGreen rounded p-6 text-[clamp(0.75rem,2vw,1rem)] leading-relaxed break-words whitespace-pre-line">
        {notice.description}
      </p>
    </div>
  );
};

export default NoticeDetail;
