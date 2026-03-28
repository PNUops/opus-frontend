import { useState } from 'react';

import { TeamDetailDto } from 'types/DTO/teams/teamsDto';
import { FaCrown } from 'react-icons/fa6';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { IoEllipsisHorizontal } from 'react-icons/io5';

interface ProjectDetailSectionProps {
  data: TeamDetailDto;
}

const ProjectDetailSection = ({ data }: ProjectDetailSectionProps) => {
  const { professorName, teamMembers, overview } = data;
  const hasProfessor = !!professorName?.trim();
  const hasTeamMembers = teamMembers.length > 0;
  const hasContributors = hasProfessor || hasTeamMembers;
  const hasOverview = overview?.trim();
  const safeOverview = overview ?? '';
  const INIT_LENGTH = 500;

  const [isFolded, setIsFolded] = useState(true);
  const shouldTruncate = safeOverview.length > INIT_LENGTH;
  const visibleText = isFolded && shouldTruncate ? safeOverview.slice(0, INIT_LENGTH) : safeOverview;

  return (
    <>
      {hasContributors && (
        <div className="flex flex-col gap-3">
          <div className="sm:text-title text-xl font-bold">Contributors</div>
          {hasProfessor && (
            <span className="flex items-center gap-3">
              <FaChalkboardTeacher className="text-teal-500" size={20} />
              <span className="bg-whiteGray text-exsm rounded-full px-3 py-1 whitespace-nowrap sm:text-sm">
                {professorName}
              </span>
            </span>
          )}
          {hasTeamMembers && (
            <div className="flex items-start gap-3">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {teamMembers.map((member, index) => (
                  <span key={member.memberId || index} className="flex items-center gap-3">
                    {member.roleType === 'ROLE_팀장' ? <FaCrown className="text-amber-300" size={20} /> : null}
                    <span className="bg-whiteGray text-exsm rounded-full px-3 py-1 whitespace-nowrap sm:text-sm">
                      {member.teamMemberName}
                    </span>
                  </span>
                ))}
              </div>
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
