import { useSuspenseQuery } from '@tanstack/react-query';
import { currentContestOption } from '@queries/contest';
import OpusMascot from './OpusMascot';
import CampusNoticeHologram from './CampusNoticeHologram';
import OpusClock from './OpusClock';

interface MastheadProps {
  onExploreContests: () => void;
}

interface MastheadContentProps extends MastheadProps {
  hasCurrentContests: boolean;
}

const MastheadContent = ({ hasCurrentContests, onExploreContests }: MastheadContentProps) => (
  <section className="opus-masthead" aria-labelledby="opus-home-title">
    <div className="opus-masthead__content">
      <div className="opus-masthead__intro">
        <OpusClock />

        <p className="opus-masthead__eyebrow">OPUS</p>

        <h1 id="opus-home-title" className="opus-masthead__title">
          <span>{hasCurrentContests ? '현재' : '최근'}</span>
          {hasCurrentContests ? ' 진행 중인 대회' : ' 대회'}
        </h1>
      </div>

      <div className="opus-mascot-zone">
        <CampusNoticeHologram onExploreContests={onExploreContests} />
        <OpusMascot />
      </div>
    </div>

    <div className="opus-masthead__rule" aria-hidden="true" />
  </section>
);

const Masthead = ({ onExploreContests }: MastheadProps) => {
  const { data: currentContests } = useSuspenseQuery(currentContestOption());

  return <MastheadContent hasCurrentContests={currentContests.length > 0} onExploreContests={onExploreContests} />;
};

export const MastheadFallback = ({ onExploreContests }: MastheadProps) => (
  <MastheadContent hasCurrentContests={false} onExploreContests={onExploreContests} />
);

export default Masthead;
