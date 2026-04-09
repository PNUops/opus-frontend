import { useQuery } from '@tanstack/react-query';
import { useTeamId } from '@hooks/useId';
import useAuth from '@hooks/useAuth';

import ProjectIntroSection from './ProjectIntroSection';
import CarouselSection from './CarouselSection';
import LikeSection from './LikeSection';
import ProjectDetailSection from './ProjectDetailSection';

import GithubCard from './MediaSection/GithubCard';
import CommentSection from './CommentSection/CommentSection';

import { useIsVoteTerm } from '@hooks/useVoteTerm';
import { teamDetailOption } from '@queries/team';
import { getPoster, PosterResult } from '@apis/projectEditor';

import {
  ProjectIntroSectionSkeleton,
  CarouselSectionSkeleton,
  LikeSectionSkeleton,
  DetailSectionSkeleton,
  MediaSectionSkeleton,
  CommentSectionSkeleton,
} from './DetailSkeleton';

import { canEditTeamPage } from '@utils/auth';

const ProjectDetailPage = () => {
  const teamId = useTeamId();
  if (!teamId) return <div>팀 ID가 없습니다.</div>;
  const { isAdmin, user } = useAuth();
  const memberId = user?.id;

  const { data, isLoading, error } = useQuery(teamDetailOption(teamId));
  const { data: posterResult } = useQuery<PosterResult>({
    queryKey: ['poster', teamId],
    queryFn: () => getPoster(teamId),
    refetchInterval: (query) => (query.state.data?.status === 'processing' ? 1500 : false),
  });

  const { isVoteTerm } = useIsVoteTerm(data?.contestId);

  if (isLoading) {
    return (
      <div>
        <ProjectIntroSectionSkeleton />
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

  const youtubeUrl = data.youTubePath ?? '';
  const githubUrl = data.githubPath ?? '';

  const isEditorOfThisTeam = canEditTeamPage(memberId ?? -1, data.teamMembers, isAdmin);
  const posterUrl = posterResult?.status === 'success' ? posterResult.url : null;

  return (
    <div className="min-w-xs px-2 sm:px-5">
      <ProjectIntroSection data={data} isEditor={isEditorOfThisTeam} />
      {posterUrl && (
        <>
          <div className="h-10" />
          <section className="from-subGreen/20 to-whiteGray/50 border-lightGray rounded-2xl border bg-gradient-to-br p-3 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="sm:text-title text-xl font-bold">Poster</h2>
              <span className="text-midGray rounded-full bg-white px-3 py-1 text-xs">팀 포스터</span>
            </div>
            <div className="border-lightGray bg-whiteGray/40 relative mx-auto w-full max-w-xl overflow-hidden rounded-xl border">
              <img src={posterUrl} alt={`${data.projectName} 포스터`} className="w-full object-contain" />
            </div>
          </section>
        </>
      )}
      <div className="h-10" />
      <CarouselSection
        teamId={data.teamId}
        previewIds={data.previewIds}
        youtubeUrl={youtubeUrl}
        isEditor={isEditorOfThisTeam}
      />
      <div className="h-10" />
      {isVoteTerm ? (
        <LikeSection contestId={data.contestId} teamId={data.teamId} isLiked={data.isLiked} isVoted={data.isVoted} />
      ) : null}
      <div className="h-10" />
      <ProjectDetailSection data={data} />
      <div className="h-10" />
      <GithubCard githubUrl={githubUrl} />
      <div className="h-28" />
      <CommentSection teamId={data.teamId} />
    </div>
  );
};

export default ProjectDetailPage;
