import { useRef } from 'react';
import QueryWrapper from '@providers/QueryWrapper';
import CurrentContestSection, { ContestGridError, ContestGridSkeleton } from './CurrentContestSection';
import Masthead from './Masthead';
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
      <Masthead onExploreContests={handleExploreContests} />

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
