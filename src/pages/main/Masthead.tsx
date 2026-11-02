import type { ReactNode } from 'react';
import QueryWrapper from '@providers/QueryWrapper';
import OpusMascot from './OpusMascot';
import CampusNoticeHologram from './CampusNoticeHologram';
import NoticeSignalSection, { NoticeSignalError, NoticeSignalSkeleton } from './NoticeSignalSection';

interface MastheadProps {
  onExploreContests: () => void;
  statisticsAction?: ReactNode;
}

const Masthead = ({ onExploreContests, statisticsAction }: MastheadProps) => (
  <section className="opus-masthead" aria-label="OPUS 메인 소식">
    <div className="opus-masthead__content">
      <div className="opus-masthead__intro">
        <QueryWrapper
          loadingFallback={<NoticeSignalSkeleton />}
          errorFallback={(props) => <NoticeSignalError {...props} />}
        >
          <NoticeSignalSection />
        </QueryWrapper>
      </div>

      <div className="opus-masthead__aside">
        {statisticsAction}
        <div className="opus-mascot-zone">
          <CampusNoticeHologram onExploreContests={onExploreContests} />
          <OpusMascot />
        </div>
      </div>
    </div>

    <div className="opus-masthead__rule" aria-hidden="true" />
  </section>
);

export default Masthead;
