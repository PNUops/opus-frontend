import { useState } from 'react';

import { ProjectDetailsResponseDto } from 'types/DTO/projectViewerDto';
import { FaCrown } from 'react-icons/fa6';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { IoEllipsisHorizontal, IoPerson } from 'react-icons/io5';

interface DetailSectionProps {
  data: ProjectDetailsResponseDto;
}

const DetailSection = ({ data }: DetailSectionProps) => {
  const { overview, professorName, leaderName, teamMembers } = data; // TODO: professorName mock data
  const hasOverview = overview?.trim();
  const safeOverview = overview ?? '';
  const INIT_LENGTH = 500;

  const [isFolded, setIsFolded] = useState(true);
  const shouldTruncate = safeOverview.length > INIT_LENGTH;
  const visibleText = isFolded && shouldTruncate ? safeOverview.slice(0, INIT_LENGTH) : safeOverview;

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="sm:text-title text-xl font-bold">Contributors</div>
        {professorName && (
          <span className="flex items-center gap-3">
            <FaChalkboardTeacher className="text-teal-500" size={20} />
            <span className="bg-whiteGray text-exsm rounded-full px-3 py-1 whitespace-nowrap sm:text-sm">
              {professorName}
            </span>
          </span>
        )}
        <span className="flex items-center gap-3">
          <FaCrown className="text-amber-300" size={20} />
          <span className="bg-whiteGray text-exsm rounded-full px-3 py-1 whitespace-nowrap sm:text-sm">
            {leaderName}
          </span>
        </span>
        <div className="flex items-start gap-3">
          <IoPerson className="h-8 shrink-0 text-blue-400" size={20} />
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex h-8 items-center">
                <span
                  key={index}
                  className="bg-whiteGray text-exsm rounded-full px-3 py-1 whitespace-nowrap sm:text-sm"
                >
                  {member.teamMemberName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

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

export default DetailSection;
