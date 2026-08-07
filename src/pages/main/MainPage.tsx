import { type FallbackProps } from 'react-error-boundary';
import { useSuspenseQuery } from '@tanstack/react-query';
import QueryWrapper from '@providers/QueryWrapper';
import { currentContestOption } from '@queries/contest';
import CurrentContestSection from './CurrentContestSection';
import LeaderSection from './LeaderSection';
import OpusMascot from './OpusMascot';
import OpusClock from './OpusClock';
import './EditorialHome.css';

const ContestGridSkeleton = () => (
  <div className="opus-contest-skeleton" aria-label="대회 목록을 불러오는 중" aria-busy="true">
    {Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="opus-contest-skeleton__item" aria-hidden="true">
        <div className="opus-contest-skeleton__line" />
        <div className="opus-contest-skeleton__line" />
        <div className="opus-contest-skeleton__line" />
      </div>
    ))}
  </div>
);

const ContestGridError = ({ resetErrorBoundary }: FallbackProps) => (
  <section className="opus-contest-error" role="alert" aria-labelledby="contest-error-title">
    <p className="opus-contest-error__number" aria-hidden="true">
      !
    </p>
    <h2 id="contest-error-title">대회 정보를 불러오지 못했습니다.</h2>
    <button type="button" onClick={resetErrorBoundary}>
      다시 시도 ↗
    </button>
  </section>
);

const MainPage = () => {
  const { data: currentContests } = useSuspenseQuery(currentContestOption());
  const heroTitle = currentContests.length > 0 ? ' 진행 중인 대회' : ' 대회';

  return (
    <main className="opus-home">
      <section className="opus-masthead" aria-labelledby="opus-home-title">
        <div className="opus-masthead__content">
          <div className="opus-masthead__intro">
            <OpusClock />
            <p className="opus-masthead__eyebrow">OPUS</p>
            <h1 id="opus-home-title" className="opus-masthead__title">
              {currentContests.length > 0 ? <span>현재</span> : <span>최근</span>}
              {heroTitle}
            </h1>
          </div>
          <OpusMascot />
        </div>

        <div className="opus-masthead__rule" aria-hidden="true" />
      </section>

      <LeaderSection />

      <QueryWrapper
        loadingFallback={<ContestGridSkeleton />}
        errorFallback={(props) => <ContestGridError {...props} />}
      >
        <CurrentContestSection />
      </QueryWrapper>
    </main>
  );
};

export default MainPage;
