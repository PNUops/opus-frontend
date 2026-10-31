import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTeamId } from '@hooks/useId';
import useAuth from '@hooks/useAuth';

import ProjectIntroSection from './ProjectIntroSection';
import ProjectMediaSection from './ProjectMediaSection';
import LikeSection from './LikeSection';
import ProjectDetailSection from './ProjectDetailSection';

import GithubCard from './MediaSection/GithubCard';
import ProjectDiscussionSection from './ProjectDiscussionSection';

import { teamDetailOption } from '@queries/team';
import { getPoster, PosterResult } from '@apis/projectEditor';
import { getRequiredFields } from '@apis/requiredFields';
import { defaultRequiredFields } from '@constants/requiredFields';
import { RequiredFieldsDto } from '@dto/requiredFieldsDto';

import { ProjectIntroSectionSkeleton, CarouselSectionSkeleton, DetailSectionSkeleton } from './DetailSkeleton';

import { canEditTeamPage } from '@utils/auth';
import { useToast } from '@hooks/useToast';

const ProjectDetailContent = ({ teamId }: { teamId: number }) => {
  const { isAdmin, isAdvisor, user } = useAuth();
  const memberId = user?.id;
  const toast = useToast();
  const posterNotFoundToast = useRef(false);

  const { data, isLoading, error, refetch } = useQuery(teamDetailOption(teamId));
  const { data: posterResult } = useQuery<PosterResult>({
    queryKey: ['poster', teamId],
    queryFn: () => getPoster(teamId),
    refetchInterval: (query) => (query.state.data?.status === 'processing' ? 1500 : false),
  });
  const { data: requiredFieldsData } = useQuery<RequiredFieldsDto>({
    queryKey: ['requiredFields', data?.contestId],
    queryFn: () => getRequiredFields(data!.contestId),
    enabled: !!data?.contestId,
  });

  const requiredFields = requiredFieldsData ?? defaultRequiredFields;
  const isEditorOfThisTeam = data ? canEditTeamPage(memberId ?? -1, data.teamMembers, isAdmin) : false;
  const canViewFeedback = isEditorOfThisTeam || isAdvisor;
  const posterUrl = posterResult?.status === 'success' ? posterResult.url : null;

  useEffect(() => {
    if (!data || !requiredFields.posterRequired) {
      posterNotFoundToast.current = false;
      return;
    }

    if (posterResult?.status === 'error' && posterResult.code === 'POSTER_NOTFOUND') {
      if (!posterNotFoundToast.current) {
        if (isEditorOfThisTeam) {
          toast('포스터를 올려주세요.', 'info');
        }
        posterNotFoundToast.current = true;
      }
    } else {
      posterNotFoundToast.current = false;
    }
  }, [data, posterResult, requiredFields.posterRequired, isEditorOfThisTeam, toast]);

  if (isLoading) {
    return (
      <div role="status" aria-label="프로젝트를 불러오는 중" className="flex flex-col gap-8">
        <ProjectIntroSectionSkeleton />
        <DetailSectionSkeleton />
        <CarouselSectionSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div role="alert" className="py-12 text-center">
        <h1 className="text-xl font-semibold">프로젝트를 불러오지 못했어요.</h1>
        <p className="mt-3 text-sm text-gray-600">잠시 후 다시 시도해 주세요.</p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="border-lightGray focus-visible:outline-mainGreen mt-4 min-h-11 rounded-md border px-5 text-sm focus-visible:outline-2"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const youtubeUrl = data.youTubePath ?? '';
  const githubUrl = data.githubPath ?? '';

  return (
    <article className="mx-auto max-w-5xl">
      <ProjectIntroSection data={data} isEditor={isEditorOfThisTeam}>
        <LikeSection contestId={data.contestId} teamId={data.teamId} isLiked={data.isLiked} isVoted={data.isVoted} />
      </ProjectIntroSection>
      <nav aria-label="프로젝트 내용 탐색" className="border-lightGray my-7 flex flex-wrap gap-x-6 border-y sm:my-8">
        {[
          { id: 'overview', label: '소개' },
          { id: 'media', label: '자료' },
          { id: 'comments', label: '댓글' },
          ...(canViewFeedback ? [{ id: 'feedback', label: '피드백' }] : []),
        ].map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className="hover:text-mainGreen focus-visible:outline-mainGreen inline-flex min-h-12 items-center rounded-sm text-sm font-medium text-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {label}
          </a>
        ))}
      </nav>
      <div className="flex flex-col gap-9 sm:gap-12">
        <ProjectDetailSection data={data} />
        <ProjectMediaSection
          teamId={data.teamId}
          projectName={data.projectName}
          posterUrl={posterUrl}
          previewIds={data.previewIds}
          youtubeUrl={youtubeUrl}
          isEditor={isEditorOfThisTeam}
          imagesRequired={requiredFields.imagesRequired}
        />
        {githubUrl && <GithubCard githubUrl={githubUrl} />}
        <ProjectDiscussionSection teamId={data.teamId} canViewFeedback={canViewFeedback} />
      </div>
    </article>
  );
};

const ProjectDetailPage = () => {
  const teamId = useTeamId();
  if (!teamId) return <p role="alert">프로젝트를 찾을 수 없습니다.</p>;
  return <ProjectDetailContent key={teamId} teamId={teamId} />;
};

export default ProjectDetailPage;
