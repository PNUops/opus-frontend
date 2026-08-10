import dayjs from 'dayjs';
import { useSuspenseQuery } from '@tanstack/react-query';
import { NoticeList, NoticeListItem, NoticeListNoData, NoticeListSkeleton } from '@components/notice';
import QueryWrapper from '@providers/QueryWrapper';
import { noticeOption } from '@queries/notices';

const NoticeItems = () => {
  const { data: notices } = useSuspenseQuery(noticeOption());
  const recentFirstNotices = [...notices].sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());

  return (
    <NoticeList>
      {recentFirstNotices.length === 0 && <NoticeListNoData />}
      {recentFirstNotices.map((notice) => (
        <NoticeListItem key={notice.noticeId} {...notice} />
      ))}
    </NoticeList>
  );
};

const NoticeListPage = () => (
  <section aria-labelledby="notice-list-title">
    <h1 id="notice-list-title" className="mb-6 text-2xl font-bold">
      전체 공지사항
    </h1>
    <QueryWrapper loadingFallback={<NoticeListSkeleton />} errorStyle="min-h-36 rounded-xl shadow-md">
      <NoticeItems />
    </QueryWrapper>
  </section>
);

export default NoticeListPage;
