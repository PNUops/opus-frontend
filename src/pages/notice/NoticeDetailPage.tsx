import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useContestId, useNoticeIdOrRedirect } from '@hooks/useId';
import { contestNoticeDetailOption, noticeDetailOption } from '@queries/notices';
import NoticeDetailSkeleton from './NoticeDetailSkeleton';
import useContestName from '@hooks/useContestName';
import { ArrowLeft } from 'lucide-react';
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
  if (isError || !notice) {
    return (
      <div role="alert" className="border-lightGray text-midGray mx-auto max-w-4xl border-y px-4 py-12 text-center">
        공지사항을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  const backTo = !contestId ? '/notices' : `/contest/${contestId}`;
  const backLabel = contestId ? `${contestName ?? '대회'}으로 돌아가기` : '전체 공지사항으로 돌아가기';

  return (
    <article className="mx-auto w-full max-w-4xl">
      <Link
        to={backTo}
        className="text-midGray hover:text-mainBlue focus-visible:ring-mainBlue -ml-2 inline-flex items-center gap-2 rounded-sm px-2 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <ArrowLeft aria-hidden="true" className="size-4 shrink-0" />
        <span className="border-b border-current">{backLabel}</span>
      </Link>

      <header className="border-lightGray mt-7 border-b pb-7 sm:mt-10 sm:pb-9">
        <h1 className="text-2xl leading-snug font-bold tracking-[-0.02em] [overflow-wrap:anywhere] text-neutral-900 sm:text-4xl">
          {notice.title}
        </h1>

        <dl className="text-midGray mt-5 grid gap-2 text-xs sm:flex sm:flex-wrap sm:gap-x-5 sm:gap-y-2 sm:text-sm">
          <div className="flex items-center gap-2">
            <dt className="font-medium">작성일</dt>
            <dd>
              <time dateTime={notice.createdAt} className="font-semibold text-neutral-700">
                {dayjs(notice.createdAt).format('YYYY.MM.DD')}
              </time>
            </dd>
          </div>
          <div className="border-lightGray flex items-center gap-2 sm:border-l sm:pl-5">
            <dt className="font-medium">수정일</dt>
            <dd>
              <time dateTime={notice.updatedAt} className="font-semibold text-neutral-700">
                {dayjs(notice.updatedAt).format('YYYY.MM.DD')}
              </time>
            </dd>
          </div>
        </dl>
      </header>

      <section aria-label="공지 내용" className="min-h-64 pt-8 sm:pt-10">
        <div className="[&_a]:text-mainBlue max-w-3xl text-neutral-800 [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-6 [&_ol]:list-decimal [&_ul]:list-disc">
          <p className="text-sm leading-7 [overflow-wrap:anywhere] whitespace-pre-wrap sm:text-base sm:leading-8">
            {notice.description}
          </p>
        </div>
      </section>
    </article>
  );
};

export default NoticeDetail;
