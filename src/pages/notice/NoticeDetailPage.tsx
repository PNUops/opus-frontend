import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useContestId, useNoticeIdOrRedirect } from '@hooks/useId';
import { contestNoticeDetailOption, noticeDetailOption } from '@queries/notices';
import NoticeDetailSkeleton from './NoticeDetailSkeleton';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getNoticeDisplayAt, isNoticeUpdated } from '@utils/notice';

const NoticeDetail = () => {
  const noticeId = useNoticeIdOrRedirect();
  const contestId = useContestId();

  const {
    data: notice,
    isLoading,
    isError,
  } = useQuery(!contestId ? noticeDetailOption(noticeId) : contestNoticeDetailOption(contestId, noticeId));

  if (isLoading) return <NoticeDetailSkeleton showBackLink={!contestId} />;
  if (isError || !notice) {
    return (
      <div role="alert" className="border-lightGray text-midGray mx-auto max-w-4xl border-y px-4 py-12 text-center">
        공지사항을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  const isModified = isNoticeUpdated(notice);
  const displayedAt = getNoticeDisplayAt(notice);

  return (
    <article className="mx-auto w-full max-w-4xl">
      <header className="border-lightGray border-b pb-7 sm:pb-9">
        <h1 className="text-2xl leading-snug font-bold tracking-[-0.02em] [overflow-wrap:anywhere] text-neutral-900 sm:text-4xl">
          {notice.title}
        </h1>

        <p className="text-midGray mt-5 text-xs sm:text-sm">
          <time dateTime={displayedAt}>{dayjs(displayedAt).format('YYYY.MM.DD HH:mm')}</time>
          {isModified && <span className="ml-1">(수정됨)</span>}
        </p>
      </header>

      <section aria-label="공지 내용" className="min-h-64 pt-8 sm:pt-10">
        <div className="[&_a]:text-mainBlue max-w-3xl text-neutral-800 [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-6 [&_ol]:list-decimal [&_ul]:list-disc">
          <p className="text-sm leading-7 [overflow-wrap:anywhere] whitespace-pre-wrap sm:text-base sm:leading-8">
            {notice.description}
          </p>
        </div>
      </section>

      {!contestId && (
        <nav aria-label="공지사항 탐색" className="mt-10 sm:mt-14">
          <Link
            to="/notices"
            viewTransition
            className="text-midGray hover:text-mainBlue focus-visible:ring-mainBlue -ml-2 inline-flex items-center gap-2 rounded-sm px-2 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
            <span className="border-b border-current">목록으로 돌아가기</span>
          </Link>
        </nav>
      )}
    </article>
  );
};

export default NoticeDetail;
