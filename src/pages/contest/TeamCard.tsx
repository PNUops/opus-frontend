import { FaHeart } from 'react-icons/fa';
import { MdHowToVote } from 'react-icons/md';
import { Link } from 'react-router-dom';
import basicThumbnail from '@assets/basicThumbnail.jpg';
import AwardTag from '@components/AwardTag';
import { AwardDto } from '@dto/awardsDto';
import useTeamThumbnail from '@hooks/useTeamThumbnail';

interface TeamCardProps {
  contestId: number;
  teamId: number;
  teamName: string;
  projectName: string;
  awards?: AwardDto[];
  isLiked?: boolean;
  isVoted?: boolean;
  isVoteTerm?: boolean;
}

const TeamCard = ({
  contestId,
  teamId,
  teamName,
  projectName,
  isLiked,
  isVoted,
  awards,
  isVoteTerm,
}: TeamCardProps) => {
  const { thumbnailUrl } = useTeamThumbnail(teamId);
  const awardsList = awards ?? [];
  const firstAward = awardsList[0];
  const remainingAwardsCount = Math.max(awardsList.length - 1, 0);

  return (
    <Link to={`/contest/${contestId}/teams/view/${teamId}`} className="flex aspect-[7/8] w-full flex-col">
      <div className="border-lightGray relative aspect-[3/2] flex-shrink-0 cursor-pointer overflow-hidden rounded-md border transition-transform duration-200 hover:scale-[1.02] hover:shadow-md">
        <img src={thumbnailUrl ?? basicThumbnail} alt="썸네일" className="h-full w-full object-contain" />
        {firstAward && (
          <div className="absolute top-2 right-2 left-2 min-w-0">
            <div className="flex min-w-0 gap-2">
              <AwardTag awardName={firstAward.awardName ?? ''} awardColor={firstAward.awardColor ?? ''} />
              {remainingAwardsCount > 0 && (
                <span className="award-tag bg-mainGreen text-subGreen relative inline-flex items-center overflow-hidden rounded-full px-2 py-0.5 text-sm font-semibold">
                  <span className="award-shimmer" />
                  <span className="relative z-10">{remainingAwardsCount}+</span>
                </span>
              )}
            </div>
          </div>
        )}

        <div className="absolute right-2 bottom-2 flex flex-shrink-0 items-center gap-1">
          {isVoteTerm
            ? isVoted && <MdHowToVote className="text-mainGreen" size="clamp(1.5rem, 2vw, 1.8rem)" />
            : isLiked && <FaHeart className="text-mainGreen" size="clamp(1.5rem, 2vw, 1.8rem)" />}
        </div>
      </div>

      <div className="flex flex-col p-3">
        <div className="text-midGray truncate overflow-hidden py-2 text-[clamp(0.8rem,1.8vw,1rem)]">{teamName}</div>
        <div className="line-clamp-2 text-[clamp(0.85rem,2vw,1.3rem)] leading-tight font-semibold text-black">
          {projectName}
        </div>
      </div>
    </Link>
  );
};

export default TeamCard;
