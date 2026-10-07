import { useSuspenseQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NoticeList, NoticeListItem, NoticeListNoData, NoticeListSkeleton } from '@components/notice';
import QueryWrapper from '@providers/QueryWrapper';
import { noticeOption } from '@queries/notices';

const NoticeItems = () => {
  const { data: notices } = useSuspenseQuery(noticeOption());

  return (
    <NoticeList variant="document">
      {notices.length === 0 && <NoticeListNoData variant="document" />}
      {notices.map((notice) => (
        <NoticeListItem key={notice.noticeId} {...notice} variant="document" />
      ))}
    </NoticeList>
  );
};

const NoticeListPage = () => (
  <section aria-labelledby="notice-list-title" className="mx-auto w-full max-w-4xl">
    <Link
      to="/"
      viewTransition
      className="text-midGray hover:text-mainBlue focus-visible:ring-mainBlue -ml-2 inline-flex items-center gap-2 rounded-sm px-2 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
      <span className="border-b border-current">메인으로 돌아가기</span>
    </Link>

    <header className="border-lightGray mt-7 border-b pb-6 sm:mt-10 sm:pb-8">
      <h1 id="notice-list-title" className="text-2xl font-bold tracking-[-0.02em] text-neutral-900 sm:text-3xl">
        전체 공지사항
      </h1>
      <p className="text-midGray mt-2 text-sm sm:text-base">OPUS의 새로운 소식과 주요 안내를 확인할 수 있어요.</p>
    </header>
    <QueryWrapper loadingFallback={<NoticeListSkeleton variant="document" />} errorStyle="min-h-36 border-b">
      <NoticeItems />
    </QueryWrapper>
  </section>
);

export default NoticeListPage;
