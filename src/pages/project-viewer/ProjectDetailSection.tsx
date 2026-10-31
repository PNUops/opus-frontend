import { useRef, useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

import { TeamDetailDto } from '@dto/teams/teamsDto';

interface ProjectDetailSectionProps {
  data: TeamDetailDto;
}

const OVERVIEW_PREVIEW_LENGTH = 220;

const ProjectDetailSection = ({ data }: ProjectDetailSectionProps) => {
  const { professorName, teamMembers, overview } = data;
  const [isExpanded, setIsExpanded] = useState(false);
  const overviewRef = useRef<HTMLElement>(null);
  const safeOverview = overview?.trim() ?? '';
  const shouldTruncate = safeOverview.length > OVERVIEW_PREVIEW_LENGTH;
  const preview = safeOverview.slice(0, OVERVIEW_PREVIEW_LENGTH);
  const paragraphEnd = preview.lastIndexOf('\n\n');
  const previewText = paragraphEnd >= 100 ? preview.slice(0, paragraphEnd) : preview;
  const visibleText = !isExpanded && shouldTruncate ? `${previewText.trimEnd()}…` : safeOverview;
  const contributors = teamMembers.filter(
    (member) => member.teamMemberName?.trim() && ['ROLE_팀장', 'ROLE_팀원'].includes(member.roleType),
  );
  const hasContributors = !!professorName?.trim() || contributors.length > 0;

  const toggleOverview = () => {
    if (isExpanded && (overviewRef.current?.getBoundingClientRect().top ?? 0) < 0) {
      overviewRef.current?.scrollIntoView({ block: 'start' });
    }
    setIsExpanded((current) => !current);
  };

  return (
    <div
      className={`grid gap-8 ${hasContributors ? 'md:grid-cols-[minmax(0,1fr)_200px] lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12' : ''}`}
    >
      <section
        ref={overviewRef}
        id="overview"
        aria-labelledby="project-overview-title"
        className="min-w-0 scroll-mt-24"
      >
        <h2 id="project-overview-title" className="mb-4 text-lg font-semibold">
          프로젝트 소개
        </h2>
        {safeOverview ? (
          <>
            <p
              id="project-overview-content"
              className="text-[15px] leading-[1.85] [overflow-wrap:anywhere] whitespace-pre-wrap text-gray-700"
            >
              {visibleText}
            </p>
            {shouldTruncate && (
              <button
                type="button"
                aria-expanded={isExpanded}
                aria-controls="project-overview-content"
                onClick={toggleOverview}
                className="text-mainBlue focus-visible:outline-mainBlue mt-3 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {isExpanded ? '소개 접기' : '소개 전체 읽기'}
                {isExpanded ? <FiChevronUp aria-hidden /> : <FiChevronDown aria-hidden />}
              </button>
            )}
          </>
        ) : (
          <p className="text-sm leading-relaxed text-gray-500">프로젝트 소개가 아직 등록되지 않았습니다.</p>
        )}
      </section>
      {hasContributors && (
        <section id="contributors" aria-labelledby="project-contributors-title" className="min-w-0 scroll-mt-24">
          <h2 id="project-contributors-title" className="mb-4 text-lg font-semibold">
            팀 정보
          </h2>
          <dl className="flex flex-col gap-3 text-sm leading-relaxed">
            {professorName?.trim() && (
              <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3">
                <dt className="text-gray-500">지도교수</dt>
                <dd className="break-words text-gray-700">{professorName}</dd>
              </div>
            )}
            {contributors.map((member) => (
              <div key={member.memberId} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3">
                <dt className="text-gray-500">{member.roleType === 'ROLE_팀장' ? '팀장' : '팀원'}</dt>
                <dd className="break-words text-gray-700">{member.teamMemberName}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
};

export default ProjectDetailSection;
