import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import LeaderMessage from '@pages/main/LeaderMessage';
import { getSubmissionStatus } from '@apis/team';
import useAuth from '@hooks/useAuth';
import { SubmissionStatusResponseDto } from '@dto/teams/submissionStatusDto';

import { TbPencil } from 'react-icons/tb';

const LeaderSection = () => {
  const { isLeader, user } = useAuth();
  const { data: submissionData } = useQuery<SubmissionStatusResponseDto>({
    queryKey: ['submissionStatus'],
    queryFn: getSubmissionStatus,
    enabled: isLeader,
  });

  const showLeaderMessage = isLeader && submissionData?.isSubmitted === false;

  if (!showLeaderMessage) return null;
  return (
    <aside className="opus-leader-alert" aria-label="프로젝트 작성 안내">
      <LeaderMessage leaderName={user?.name ?? '팀장'} />
      <Link to={`/teams/edit/${submissionData?.teamId}`} className="opus-leader-alert__link">
        <TbPencil aria-hidden="true" />
        <span>작성하러 가기</span>
      </Link>
    </aside>
  );
};

export default LeaderSection;
