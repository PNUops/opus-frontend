import { useQuery } from '@tanstack/react-query';
import { useTeamId } from 'hooks/useId';
import useAuth from 'hooks/useAuth';

import { getProjectDetails } from 'apis/projectViewer';

import IntroSection from './IntroSection';
import CarouselSection from './CarouselSection';
import LikeSection from './LikeSection';
import DetailSection from './DetailSection';

import GithubCard from './MediaSection/GithubCard';
import CommentSection from './CommentSection/CommentSection';

import { useIsVoteTerm } from 'hooks/useVoteTerm';

import {
  IntroSectionSkeleton,
  CarouselSectionSkeleton,
  LikeSectionSkeleton,
  DetailSectionSkeleton,
  MediaSectionSkeleton,
  CommentSectionSkeleton,
} from './ViewerSkeleton';

const ProjectViewerPage = () => {
  const teamId = useTeamId();
  const { isLeader, isAdmin, user } = useAuth();
  const memberId = user?.id;

  const { data, isLoading, error } = useQuery({
    queryKey: ['projectDetails', teamId],
    queryFn: async () => {
      if (teamId === null) throw new Error('teamId is null');
      return getProjectDetails(teamId);
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const { isVoteTerm } = useIsVoteTerm(data?.contestId);

  if (isLoading) {
    return (
      <div>
        <IntroSectionSkeleton />
        <div className="h-5" />
        <CarouselSectionSkeleton />
        <div className="h-7" />
        <LikeSectionSkeleton />
        <div className="h-20" />
        <DetailSectionSkeleton />
        <div className="h-20" />
        <MediaSectionSkeleton />
        <div className="h-20" />
        <CommentSectionSkeleton />
      </div>
    );
  }

  if (error) return <div>에러 발생: {String(error)}</div>;
  if (!data) return <div>데이터를 불러올 수 없습니다.</div>;

  // const isLeaderOfThisTeam = isLeader && memberId == data.leaderId;
  const isContributorOfThisTeam =
    data &&
    memberId &&
    (memberId === data.leaderId || data.teamMembers.some((member) => member.teamMemberId === memberId));

  return (
    <div className="min-w-xs px-2 sm:px-5">
      <IntroSection data={data} isEditor={isContributorOfThisTeam || isAdmin} />
      <div className="h-10" />
      <CarouselSection
        teamId={data.teamId}
        previewIds={data.previewIds}
        youtubeUrl={data.youTubePath}
        isEditor={isContributorOfThisTeam || isAdmin}
      />
      <div className="h-10" />
      {isVoteTerm ? <LikeSection contestId={data.contestId} teamId={data.teamId} isLiked={data.isLiked} /> : null}
      <div className="h-10" />
      <DetailSection data={data} />
      <div className="h-10" />
      <GithubCard githubUrl={data.githubPath} />
      <div className="h-28" />
      <CommentSection teamId={data.teamId} />
    </div>
  );
};

export default ProjectViewerPage;
