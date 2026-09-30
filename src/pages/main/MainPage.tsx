import { useEffect, useRef, useState } from 'react';
import QueryWrapper from '@providers/QueryWrapper';
import CurrentContestSection, { ContestGridError, ContestGridSkeleton } from './CurrentContestSection';
import Masthead from './Masthead';
import ArchiveProjectSection, { ArchiveProjectError, ArchiveProjectSkeleton } from './ArchiveProjectSection';
import LiveIndexView, { LiveIndexError, LiveIndexSkeleton } from './LiveIndexView';
import MainViewTransition, { type MainViewTransitionDirection } from './MainViewTransition';
import './EditorialHome.css';
import './LiveIndex.css';

type MainView = 'default' | 'live-index';

const VIEW_SWAP_DELAY = 450;
const VIEW_TRANSITION_DURATION = 900;

const MainPage = () => {
  const contestSectionRef = useRef<HTMLDivElement>(null);
  const liveIndexBackRef = useRef<HTMLButtonElement>(null);
  const liveIndexTriggerRef = useRef<HTMLButtonElement>(null);
  const previousScrollPositionRef = useRef(0);
  const swapTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const [view, setView] = useState<MainView>('default');
  const [transitionDirection, setTransitionDirection] = useState<MainViewTransitionDirection | null>(null);
  const [transitionTop, setTransitionTop] = useState(0);

  useEffect(
    () => () => {
      if (swapTimerRef.current !== null) window.clearTimeout(swapTimerRef.current);
      if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
    },
    [],
  );

  const moveToView = (nextView: MainView, returnToContest = false) => {
    if (nextView === view || transitionDirection) return;

    if (nextView === 'live-index') previousScrollPositionRef.current = window.scrollY;

    const regionTop = contestSectionRef.current?.getBoundingClientRect().top ?? 0;
    setTransitionTop(Math.max(0, Math.min(window.innerHeight, regionTop)));

    const updateView = (reduceMotion = false) => {
      setView(nextView);
      window.requestAnimationFrame(() => {
        if (nextView === 'live-index') {
          liveIndexBackRef.current?.focus({ preventScroll: true });
          if (reduceMotion) contestSectionRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
          return;
        }

        liveIndexTriggerRef.current?.focus({ preventScroll: true });
        if (returnToContest) {
          contestSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: previousScrollPositionRef.current, behavior: 'auto' });
        }
      });
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      updateView(true);
      return;
    }

    setTransitionDirection(nextView === 'live-index' ? 'forward' : 'backward');
    swapTimerRef.current = window.setTimeout(updateView, VIEW_SWAP_DELAY);
    transitionTimerRef.current = window.setTimeout(() => {
      setTransitionDirection(null);
      if (nextView === 'live-index') {
        window.requestAnimationFrame(() => {
          contestSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }, VIEW_TRANSITION_DURATION);
  };

  const handleExploreContests = () => {
    if (view === 'live-index') {
      moveToView('default', true);
      return;
    }

    contestSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <main className="opus-home">
      <Masthead onExploreContests={handleExploreContests} />

      {view === 'default' && (
        <button
          ref={liveIndexTriggerRef}
          type="button"
          className="opus-live-index-trigger"
          onClick={() => moveToView('live-index')}
          disabled={transitionDirection !== null}
        >
          숫자로 보는 OPUS <span aria-hidden="true">↗</span>
        </button>
      )}

      <div ref={contestSectionRef} className="opus-main-view-region">
        {view === 'default' ? (
          <>
            <QueryWrapper
              loadingFallback={<ContestGridSkeleton />}
              errorFallback={(props) => <ContestGridError {...props} />}
            >
              <CurrentContestSection />
            </QueryWrapper>

            <QueryWrapper
              loadingFallback={<ArchiveProjectSkeleton />}
              errorFallback={(props) => <ArchiveProjectError {...props} />}
            >
              <ArchiveProjectSection />
            </QueryWrapper>
          </>
        ) : (
          <section className="opus-live-index-shell" aria-label="OPUS Live Index">
            <button
              ref={liveIndexBackRef}
              type="button"
              className="opus-live-index__back"
              onClick={() => moveToView('default')}
              disabled={transitionDirection !== null}
            >
              <span aria-hidden="true">←</span> 콘텐츠로 돌아가기
            </button>
            <QueryWrapper
              loadingFallback={<LiveIndexSkeleton />}
              errorFallback={(props) => <LiveIndexError {...props} />}
            >
              <LiveIndexView />
            </QueryWrapper>
          </section>
        )}
      </div>

      {transitionDirection && <MainViewTransition direction={transitionDirection} top={transitionTop} />}
    </main>
  );
};

export default MainPage;
