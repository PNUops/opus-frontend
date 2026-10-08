import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { useSuspenseQuery } from '@tanstack/react-query';
import { noticeOption } from '@queries/notices';
import { type FallbackProps } from 'react-error-boundary';
import type { NoticeListDto } from '@dto/noticeDto';

const NoticeSignalSection = () => {
  const { data: notices } = useSuspenseQuery(noticeOption());
  const recentNotices = notices.slice(0, 5);

  return (
    <section className="opus-signal-section" aria-labelledby="opus-signal-title">
      <header className="opus-signal-section__header">
        <span>NOTICE</span>
      </header>

      {recentNotices.length > 0 ? (
        <ol className="opus-signal-list">
          {recentNotices.map((notice) => (
            <NoticeSignalItem key={notice.noticeId} notice={notice} />
          ))}
        </ol>
      ) : (
        <p className="opus-signal-section__empty">새로운 공지가 없습니다.</p>
      )}

      <Link to="/notices" viewTransition className="opus-editorial-link opus-signal-section__more">
        전체 공지 보기
      </Link>
    </section>
  );
};

interface NoticeSignalItemProps {
  notice: NoticeListDto;
}

function NoticeSignalItem({ notice }: NoticeSignalItemProps) {
  const createdAt = dayjs(notice.createdAt);
  const showNewLabel = createdAt.isAfter(dayjs().subtract(3, 'day'));

  return (
    <li>
      <Link to={`/notices/${notice.noticeId}`} viewTransition className="opus-signal-list__link">
        <time dateTime={createdAt.format('YYYY-MM-DD')}>
          <span className="opus-signal-list__date-full">{createdAt.format('YYYY.MM.DD')}</span>
          <span className="opus-signal-list__date-compact">{createdAt.format('MM.DD')}</span>
        </time>
        <span className="opus-signal-list__headline">
          <span className="opus-signal-list__title">{notice.title}</span>
          {showNewLabel && (
            <span aria-label="새 공지" className="opus-signal-list__new">
              NEW
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}

export const NoticeSignalSkeleton = () => (
  <section className="opus-signal-section" aria-label="최근 공지를 불러오는 중" aria-busy="true">
    <header className="opus-signal-section__header">
      <span>NOTICE</span>
    </header>
    <div className="opus-signal-skeleton" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  </section>
);

export const NoticeSignalError = ({ resetErrorBoundary }: FallbackProps) => (
  <section className="opus-signal-section opus-signal-section--error" role="alert">
    <header className="opus-signal-section__header">
      <div>
        <span className="opus-campus-news__signal" aria-hidden="true" />
        <h1>OPUS SIGNAL</h1>
      </div>
    </header>
    <div className="opus-signal-section__error-message">
      <p>공지를 불러오지 못했습니다.</p>
      <button type="button" onClick={resetErrorBoundary}>
        다시 시도 ↗
      </button>
    </div>
  </section>
);

export default NoticeSignalSection;
