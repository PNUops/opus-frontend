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

  return (
    <Link to={`/contest/${contestId}/teams/view/${teamId}`} className="flex aspect-[7/8] w-full flex-col">
      <div className="border-lightGray relative aspect-[3/2] flex-shrink-0 cursor-pointer overflow-hidden rounded-md border transition-transform duration-200 hover:scale-[1.02] hover:shadow-md">
        <img src={thumbnailUrl ?? basicThumbnail} alt="썸네일" className="h-full w-full object-contain" />
        <div className="absolute top-2 right-2 left-2 flex flex-wrap gap-1">
          {awards &&
            awards.length > 0 &&
            awards.map((award) => (
              <div key={award.awardName} className="max-w-full min-w-0 flex-auto">
                <AwardTag awardName={award.awardName ?? ''} awardColor={award.awardColor ?? ''} />
              </div>
            ))}
        </div>
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
