import { Link } from 'react-router-dom';
import { useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { contestsOption, currentContestOption } from '@queries/contest';
import { type ContestResponseDto, type CurrentContestResponseDto } from '@dto/contestsDto';

const geometryPatterns = ['dots', 'lines', 'arc', 'quarter'] as const;

const getGeometryPieceCount = (pattern: (typeof geometryPatterns)[number]) => {
  if (pattern === 'dots') return 40;
  if (pattern === 'lines') return 9;
  return 0;
};

const getContestStatus = (contest: CurrentContestResponseDto) => {
  const today = dayjs();
  const startAt = dayjs(contest.voteStartAt);
  const endAt = dayjs(contest.voteEndAt);

  if (today.isBefore(startAt, 'day')) return '투표 예정';
  if (today.isAfter(endAt, 'day')) return '투표 종료';
  return '투표 진행 중';
};

const getGridLayout = (contestCount: number) => {
  if (contestCount <= 1) return 'single';
  if (contestCount === 2) return 'pair';
  if (contestCount === 3) return 'trio';
  return 'multiple';
};

const ContestPeriod = ({ contest }: { contest: CurrentContestResponseDto }) => {
  const startAt = dayjs(contest.voteStartAt);
  const endAt = dayjs(contest.voteEndAt);
  const endLabel = startAt.year() === endAt.year() ? endAt.format('MM. DD') : endAt.format('YYYY. MM. DD');

  return (
    <p className="opus-contest-card__period">
      <time dateTime={startAt.format('YYYY-MM-DD')}>{startAt.format('YYYY. MM. DD')}</time>
      <span aria-hidden="true"> — </span>
      <time dateTime={endAt.format('YYYY-MM-DD')}>{endLabel}</time>
    </p>
  );
};

const CurrentContestSection = () => {
  const { data: currentContests } = useSuspenseQuery(currentContestOption());
  const { data: allContests } = useSuspenseQuery(contestsOption());

  const hasCurrentContests = currentContests.length > 0;
  const recentContests = [...allContests]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 3);

  if (!hasCurrentContests) {
    return (
      <section className="opus-contest-region" aria-label={`최근 대회 ${recentContests.length}개`}>
        <div className="opus-contest-grid" data-layout={getGridLayout(recentContests.length)}>
          {recentContests.map((contest, index) => {
            const geometryPattern = geometryPatterns[index % geometryPatterns.length];

            return (
              <article
                key={contest.contestId}
                className="opus-contest-card"
                style={{ animationDelay: `${280 + Math.min(index, 8) * 85}ms` }}
              >
                <Link
                  to={`/contest/${contest.contestId}`}
                  className="opus-contest-card__link"
                  aria-label={`${contest.contestName} 대회 보기`}
                >
                  <div className="opus-contest-card__top">
                    <span className="opus-contest-card__number" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="opus-contest-card__geometry" data-pattern={geometryPattern} aria-hidden="true">
                      {Array.from({ length: getGeometryPieceCount(geometryPattern) }).map((_, pieceIndex) => (
                        <span key={pieceIndex} />
                      ))}
                    </span>
                  </div>

                  <h2 className="opus-contest-card__title">{contest.contestName}</h2>

                  <div className="opus-contest-card__details">
                    <p className="opus-contest-card__period">
                      <time dateTime={dayjs(contest.updatedAt).format('YYYY-MM-DD')}>
                        {dayjs(contest.updatedAt).format('YYYY. MM. DD')}
                      </time>
                    </p>
                    <span className="opus-contest-card__status">최근 업데이트</span>
                    <span className="opus-contest-card__cta" aria-hidden="true">
                      대회 보기 <span className="opus-contest-card__arrow">↗</span>
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <section className="opus-contest-region" aria-label={`현재 진행 중인 대회 ${currentContests.length}개`}>
      <div className="opus-contest-grid" data-layout={getGridLayout(currentContests.length)}>
        {currentContests.map((contest, index) => {
          const geometryPattern = geometryPatterns[index % geometryPatterns.length];

          return (
            <article
              key={contest.contestId}
              className="opus-contest-card"
              style={{ animationDelay: `${280 + Math.min(index, 8) * 85}ms` }}
            >
              <Link
                to={`/contest/${contest.contestId}`}
                className="opus-contest-card__link"
                aria-label={`${contest.contestName} 대회 보기`}
              >
                <div className="opus-contest-card__top">
                  <span className="opus-contest-card__number" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="opus-contest-card__geometry" data-pattern={geometryPattern} aria-hidden="true">
                    {Array.from({ length: getGeometryPieceCount(geometryPattern) }).map((_, pieceIndex) => (
                      <span key={pieceIndex} />
                    ))}
                  </span>
                </div>

                <h2 className="opus-contest-card__title">{contest.contestName}</h2>

                <div className="opus-contest-card__details">
                  <ContestPeriod contest={contest} />
                  <span className="opus-contest-card__status">{getContestStatus(contest)}</span>
                  <span className="opus-contest-card__cta" aria-hidden="true">
                    대회 보기 <span className="opus-contest-card__arrow">↗</span>
                  </span>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default CurrentContestSection;
