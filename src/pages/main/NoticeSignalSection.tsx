import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';
import { noticeOption } from '@queries/notices';
import type { NoticeListDto } from '@dto/noticeDto';

const signalSectionClassName = 'm-2.5 min-w-0 w-[min(100%,40rem)]';
const signalHeaderClassName = 'flex items-center justify-between gap-3 border-b border-[rgba(229,240,252,0.2)] pb-2.5';
const signalLabelClassName = 'm-0 text-[0.58rem] font-[800] tracking-[0.12em] text-[var(--opus-home-cyan)]';

const NoticeSignalSection = () => {
  const { data: notices } = useSuspenseQuery(noticeOption());
  const recentNotices = notices.slice(0, 5);

  return (
    <section className={signalSectionClassName} aria-labelledby="opus-signal-title">
      <NoticeSignalHeader titleId="opus-signal-title" showMore />

      {recentNotices.length > 0 ? (
        <ol className="m-0 list-none p-0 [&>li+li]:border-t [&>li+li]:border-[rgba(229,240,252,0.1)]">
          {recentNotices.map((notice) => (
            <NoticeSignalItem key={notice.noticeId} notice={notice} />
          ))}
        </ol>
      ) : (
        <p className="m-0 px-px pt-3 pb-1 text-[0.72rem] text-[rgba(248,246,240,0.54)]">새로운 공지가 없습니다.</p>
      )}
    </section>
  );
};

interface NoticeSignalHeaderProps {
  titleId?: string;
  showMore?: boolean;
}

const NoticeSignalHeader = ({ titleId, showMore = false }: NoticeSignalHeaderProps) => (
  <header className={signalHeaderClassName}>
    <h1 id={titleId} className={signalLabelClassName}>
      NOTICE
    </h1>
    {showMore && (
      <Link
        to="/notices"
        viewTransition
        className="inline-flex items-center border-b border-[var(--opus-home-cyan)] py-1 text-[0.72rem] font-[780] text-[var(--opus-home-ink)] no-underline transition-colors hover:text-[var(--opus-home-cyan)] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[var(--opus-home-cyan)]"
      >
        전체 공지 보기
      </Link>
    )}
  </header>
);

interface NoticeSignalItemProps {
  notice: NoticeListDto;
}

function NoticeSignalItem({ notice }: NoticeSignalItemProps) {
  const createdAt = dayjs(notice.createdAt);
  const showNewLabel = createdAt.isAfter(dayjs().subtract(3, 'day'));

  return (
    <li>
      <Link
        to={`/notices/${notice.noticeId}`}
        viewTransition
        className="group relative -mx-2 grid min-h-[50px] grid-cols-[42px_minmax(0,1fr)] items-center gap-2.5 rounded-lg p-2 text-inherit no-underline transition-[background-color,color] duration-150 hover:bg-[rgba(69,214,236,0.08)] hover:text-[var(--opus-home-cyan)] focus-visible:bg-[rgba(69,214,236,0.08)] focus-visible:text-[var(--opus-home-cyan)] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[var(--opus-home-cyan)] min-[721px]:-mx-2.5 min-[721px]:min-h-12 min-[721px]:grid-cols-[76px_minmax(0,1fr)] min-[721px]:gap-3.5 min-[721px]:px-2.5"
      >
        <span
          aria-hidden="true"
          className="absolute inset-y-[9px] left-0 w-0.5 scale-y-[0.45] rounded-full bg-[var(--opus-home-cyan)] opacity-0 transition-[opacity,transform] duration-150 group-hover:scale-y-100 group-hover:opacity-100 group-focus-visible:scale-y-100 group-focus-visible:opacity-100"
        />
        <time
          dateTime={createdAt.format('YYYY-MM-DD')}
          className="block text-[0.66rem] leading-none font-[800] tracking-[0.035em] whitespace-nowrap text-[var(--opus-home-blue)] tabular-nums"
        >
          <span className="hidden min-[721px]:inline">{createdAt.format('YYYY.MM.DD')}</span>
          <span className="inline min-[721px]:hidden">{createdAt.format('MM.DD')}</span>
        </time>
        <span className="flex min-w-0 items-center gap-[5px]">
          <span className="block max-w-full min-w-0 flex-[0_1_auto] truncate text-[0.8rem] leading-[1.3] font-[680] text-[var(--opus-home-ink)] transition-colors duration-150 group-hover:text-white group-focus-visible:text-white min-[721px]:text-[0.84rem] min-[721px]:leading-[1.35]">
            {notice.title}
          </span>
          {showNewLabel && (
            <span
              aria-label="새 공지"
              className="size-1.5 shrink-0 rounded-full bg-[var(--opus-home-lime)] shadow-[0_0_6px_rgba(190,217,37,0.78),0_0_12px_rgba(190,217,37,0.38)]"
            />
          )}
        </span>
      </Link>
    </li>
  );
}

export const NoticeSignalSkeleton = () => (
  <section className={signalSectionClassName} aria-label="최근 공지를 불러오는 중" aria-busy="true">
    <NoticeSignalHeader />
    <div className="flex flex-col" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={index}
          className="block h-[50px] w-full animate-pulse border-b border-[rgba(229,240,252,0.1)] bg-[rgba(229,240,252,0.08)] min-[721px]:h-12"
        />
      ))}
    </div>
  </section>
);

export const NoticeSignalError = ({ resetErrorBoundary }: FallbackProps) => (
  <section className={signalSectionClassName} role="alert">
    <NoticeSignalHeader />
    <div className="flex min-h-[62px] items-center justify-between gap-3">
      <p className="m-0 text-[0.7rem] text-[var(--opus-home-muted)]">공지를 불러오지 못했습니다.</p>
      <button
        type="button"
        onClick={resetErrorBoundary}
        className="border-0 border-b border-[var(--opus-home-cyan)] bg-transparent px-0 py-1.5 text-[0.7rem] font-[750] text-[var(--opus-home-ink)] transition-colors hover:text-[var(--opus-home-cyan)] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[var(--opus-home-cyan)]"
      >
        다시 시도
      </button>
    </div>
  </section>
);

export default NoticeSignalSection;
