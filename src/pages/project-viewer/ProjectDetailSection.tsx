import { useState } from 'react';

import { TeamDetailDto } from 'types/DTO/teams/teamsDto';
import { IoEllipsisHorizontal } from 'react-icons/io5';

interface ProjectDetailSectionProps {
  data: TeamDetailDto;
}

const ProjectDetailSection = ({ data }: ProjectDetailSectionProps) => {
  const { professorName, teamMembers, overview } = data;

  const teamLeaderName = teamMembers.find((member) => member.roleType === 'ROLE_팀장')?.teamMemberName;
  const teamMemberNames = teamMembers
    .map((member) => (member.roleType === 'ROLE_팀원' ? member.teamMemberName : null))
    .filter(Boolean) as string[];

  const hasProfessor = !!professorName?.trim();
  const hasTeamLeader = !!teamLeaderName?.trim();
  const hasTeamMembers = teamMemberNames.length > 0;
  const hasContributors = hasProfessor || hasTeamLeader || hasTeamMembers;
  const hasOverview = overview?.trim();
  const safeOverview = overview ?? '';
  const OVERVIEW_LENGTH = 500;

  const [isFolded, setIsFolded] = useState(true);
  const shouldTruncate = safeOverview.length > OVERVIEW_LENGTH;
  const visibleText = isFolded && shouldTruncate ? safeOverview.slice(0, OVERVIEW_LENGTH) : safeOverview;

  return (
    <>
      {hasContributors && (
        <div className="flex flex-col gap-3">
          <div className="sm:text-title text-xl font-bold">Contributors</div>
          {(hasProfessor || hasTeamLeader || hasTeamMembers) && (
            <div className="flex flex-col gap-2 sm:gap-3">
              {hasProfessor && (
                <div className="flex items-start gap-2">
                  <span className="text-mainGreen/60 border-mainGreen/50 inline-flex h-8 w-[70px] items-center justify-center rounded-full border px-3 text-xs font-medium whitespace-nowrap">
                    지도교수
                  </span>
                  <span className="bg-whiteGray inline-flex h-8 items-center rounded-full px-3 text-sm font-medium whitespace-nowrap text-slate-800">
                    {professorName}
                  </span>
                </div>
              )}
              {hasTeamLeader && (
                <div className="flex items-start gap-2">
                  <span className="text-mainGreen/60 border-mainGreen/50 inline-flex h-8 w-[70px] items-center justify-center rounded-full border px-3 text-xs font-medium whitespace-nowrap">
                    팀장
                  </span>
                  <span className="bg-whiteGray inline-flex h-8 items-center rounded-full px-3 text-sm font-medium whitespace-nowrap text-slate-800">
                    {teamLeaderName}
                  </span>
                </div>
              )}
              {hasTeamMembers && (
                <div className="flex items-start gap-2">
                  <span className="text-mainGreen/60 border-mainGreen/50 inline-flex h-8 w-[70px] items-center justify-center rounded-full border px-3 text-xs font-medium whitespace-nowrap">
                    팀원
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {teamMemberNames.map((name) => (
                      <span
                        key={name}
                        className="bg-whiteGray inline-flex h-8 items-center rounded-full px-3 text-sm font-medium whitespace-nowrap text-slate-800"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {hasOverview && (
        <>
          <div className="h-10" />
          <div className="flex flex-col gap-3">
            <div className="sm:text-title text-xl font-bold">Overview</div>
            <div className="bg-whiteGray text-exsm rounded p-4 leading-[1.7] whitespace-pre-wrap sm:text-sm">
              {visibleText}
              {shouldTruncate && (
                <button
                  className="bg-subGreen text-mainGreen mx-3 cursor-pointer rounded-full px-3 py-1 text-xs hover:bg-emerald-100"
                  onClick={() => setIsFolded(!isFolded)}
                >
                  {isFolded ? <IoEllipsisHorizontal /> : '간략히'}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProjectDetailSection;
