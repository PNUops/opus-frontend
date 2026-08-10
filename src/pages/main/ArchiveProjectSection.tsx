import { Link } from 'react-router-dom';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { type FallbackProps } from 'react-error-boundary';
import { archiveProjectsOption } from '@queries/contest';

const ArchiveGeometry = () => (
  <span className="opus-archive-feature__geometry" aria-hidden="true">
    {Array.from({ length: 24 }).map((_, index) => (
      <span key={index} />
    ))}
  </span>
);

const ArchiveProjectSection = () => {
  const queryClient = useQueryClient();
  const { data: projects } = useSuspenseQuery(archiveProjectsOption(queryClient));

  if (projects.length === 0) return null;

  const [featuredProject, ...compactProjects] = projects;
  const moreProjectsPath = `/contest/${featuredProject.contestId}`;

  return (
    <section className="opus-archive-section" aria-labelledby="opus-archive-title">
      <header className="opus-archive-section__header">
        <p>ARCHIVE</p>
        <h2 id="opus-archive-title">다시 보는 프로젝트</h2>
      </header>

      <div className="opus-archive-layout" data-layout={compactProjects.length > 0 ? 'split' : 'single'}>
        <article className="opus-archive-feature">
          <Link
            to={`/contest/${featuredProject.contestId}/teams/view/${featuredProject.teamId}`}
            className="opus-archive-feature__link"
            aria-label={`${featuredProject.projectName} 프로젝트 보기`}
          >
            <span className="opus-archive-project__number" aria-hidden="true">
              01
            </span>
            <ArchiveGeometry />
            <h3>{featuredProject.projectName}</h3>
            <p>{featuredProject.overview || '프로젝트 소개가 등록되지 않았습니다.'}</p>
            <span className="opus-archive-project__meta">{featuredProject.contestName}</span>
            <span className="opus-archive-project__cta" aria-hidden="true">
              프로젝트 보기 <span>↗</span>
            </span>
          </Link>
        </article>

        {compactProjects.length > 0 && (
          <ol className="opus-archive-compact" start={2}>
            {compactProjects.map((project, index) => (
              <li key={project.teamId}>
                <Link
                  to={`/contest/${project.contestId}/teams/view/${project.teamId}`}
                  className="opus-archive-compact__link"
                  aria-label={`${project.projectName} 프로젝트 보기`}
                >
                  <span className="opus-archive-project__number" aria-hidden="true">
                    {String(index + 2).padStart(2, '0')}
                  </span>
                  <span className="opus-archive-compact__copy">
                    <strong>{project.projectName}</strong>
                    <span>{project.overview || '프로젝트 소개가 등록되지 않았습니다.'}</span>
                    <small>{project.contestName}</small>
                  </span>
                  <span className="opus-archive-compact__arrow" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>

      <Link to={moreProjectsPath} className="opus-editorial-link opus-archive-section__more">
        프로젝트 더 보기 <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
};

export const ArchiveProjectSkeleton = () => (
  <section className="opus-archive-section" aria-label="과거 프로젝트를 불러오는 중" aria-busy="true">
    <header className="opus-archive-section__header">
      <p>ARCHIVE</p>
      <h2>다시 보는 프로젝트</h2>
    </header>
    <div className="opus-archive-skeleton" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  </section>
);

export const ArchiveProjectError = ({ resetErrorBoundary }: FallbackProps) => (
  <section className="opus-archive-section opus-archive-section--error" role="alert">
    <p>과거 프로젝트를 불러오지 못했습니다.</p>
    <button type="button" onClick={resetErrorBoundary}>
      다시 시도 ↗
    </button>
  </section>
);

export default ArchiveProjectSection;
