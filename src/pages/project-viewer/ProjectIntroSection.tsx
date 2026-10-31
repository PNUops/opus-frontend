import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FaAward, FaGithub, FaYoutube } from 'react-icons/fa';
import { FiArrowUpRight, FiEdit2 } from 'react-icons/fi';
import { RiLink } from 'react-icons/ri';

import { TeamDetailDto } from '@dto/teams/teamsDto';

interface ProjectIntroSectionProps {
  data: TeamDetailDto;
  isEditor: boolean;
  children: ReactNode;
}

const actionClassName =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-lightGray bg-white px-4 text-sm font-medium text-gray-700 transition-colors hover:border-mainGreen hover:text-mainGreen focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mainGreen';

const UrlButton = ({ url }: { url: string }) => {
  const result = url.includes('github.com')
    ? { icon: <FaGithub aria-hidden />, text: 'GitHub' }
    : url.includes('youtube.com') || url.includes('youtu.be')
      ? { icon: <FaYoutube aria-hidden />, text: 'YouTube' }
      : url.includes('https://')
        ? { icon: <RiLink aria-hidden />, text: '프로젝트 보러가기' }
        : null;

  if (!result) return null;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={actionClassName}>
      {result.icon}
      <span>{result.text}</span>
      <FiArrowUpRight aria-hidden className="shrink-0" />
      <span className="sr-only">(새 창)</span>
    </a>
  );
};

const ProjectIntroSection = ({ data, isEditor, children }: ProjectIntroSectionProps) => {
  const { awards, contestId, contestName, trackName, teamId, teamName, projectName, productionPath } = data;
  const visibleAwards = awards.filter((award) => award.awardName && award.awardColor);

  return (
    <header className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-relaxed text-gray-600">
        <Link
          to={`/contest/${contestId}`}
          className="hover:text-mainGreen focus-visible:outline-mainGreen rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {contestName}
        </Link>
        {trackName && <span className="border-lightGray border-l pl-3">{trackName}</span>}
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl leading-[1.4] font-bold [overflow-wrap:anywhere] break-keep sm:text-3xl">
          {projectName?.trim() || '프로젝트명 미등록'}
        </h1>
        {teamName?.trim() && <p className="text-base leading-relaxed break-words text-gray-600">{teamName}</p>}
        {visibleAwards.length > 0 && (
          <div id="awards" className="flex max-w-full scroll-mt-24 flex-wrap gap-2">
            {visibleAwards.map((award) => (
              <span
                key={award.awardId}
                className="bg-whiteGray inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1 text-sm font-medium text-gray-700"
              >
                <FaAward aria-hidden className="shrink-0" style={{ color: award.awardColor }} />
                <span className="min-w-0 break-words">{award.awardName}</span>
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {children}
        {productionPath && <UrlButton url={productionPath} />}
        {isEditor && (
          <Link to={`/contest/${contestId}/teams/edit/${teamId}`} className={actionClassName}>
            <FiEdit2 aria-hidden />
            수정하기
          </Link>
        )}
      </div>
    </header>
  );
};

export default ProjectIntroSection;
