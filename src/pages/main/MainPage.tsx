import { useRef } from 'react';
import QueryWrapper from '@providers/QueryWrapper';
import CurrentContestSection, { ContestGridError, ContestGridSkeleton } from './CurrentContestSection';
import Masthead, { MastheadFallback } from './Masthead';
import NoticeSignalSection, { NoticeSignalError, NoticeSignalSkeleton } from './NoticeSignalSection';
import ArchiveProjectSection, { ArchiveProjectError, ArchiveProjectSkeleton } from './ArchiveProjectSection';
import './EditorialHome.css';

const MainPage = () => {
  const contestSectionRef = useRef<HTMLDivElement>(null);

  const handleExploreContests = () => {
    contestSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <main className="opus-home">
      <QueryWrapper
        loadingFallback={<MastheadFallback onExploreContests={handleExploreContests} />}
        errorFallback={() => <MastheadFallback onExploreContests={handleExploreContests} />}
      >
        <Masthead onExploreContests={handleExploreContests} />
      </QueryWrapper>

      <QueryWrapper
        loadingFallback={<NoticeSignalSkeleton />}
        errorFallback={(props) => <NoticeSignalError {...props} />}
      >
        <NoticeSignalSection />
      </QueryWrapper>

      <div ref={contestSectionRef}>
        <QueryWrapper
          loadingFallback={<ContestGridSkeleton />}
          errorFallback={(props) => <ContestGridError {...props} />}
        >
          <CurrentContestSection />
        </QueryWrapper>
      </div>

      <QueryWrapper
        loadingFallback={<ArchiveProjectSkeleton />}
        errorFallback={(props) => <ArchiveProjectError {...props} />}
      >
        <ArchiveProjectSection />
      </QueryWrapper>
    </main>
  );
};

export default MainPage;
