import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTeamId } from '@hooks/useId';
import useAuth from '@hooks/useAuth';

import ProjectIntroSection from './ProjectIntroSection';
import CarouselSection from './CarouselSection';
import LikeSection from './LikeSection';
import ProjectDetailSection from './ProjectDetailSection';

import GithubCard from './MediaSection/GithubCard';
import CommentSection from './CommentSection/CommentSection';

import { teamDetailOption } from '@queries/team';
import { getPoster, PosterResult } from '@apis/projectEditor';
import { getRequiredFields } from '@apis/requiredFields';
import { defaultRequiredFields } from '@constants/requiredFields';
import { RequiredFieldsDto } from '@dto/requiredFieldsDto';

import {
  ProjectIntroSectionSkeleton,
  CarouselSectionSkeleton,
  LikeSectionSkeleton,
  DetailSectionSkeleton,
  MediaSectionSkeleton,
  CommentSectionSkeleton,
} from './DetailSkeleton';

import { canEditTeamPage } from '@utils/auth';
import { useToast } from '@hooks/useToast';

const ProjectDetailPage = () => {
  const teamId = useTeamId();
  if (!teamId) return <div>Team ID not found.</div>;

  const { isAdmin, user } = useAuth();
  const memberId = user?.id;
  const toast = useToast();
  const posterNotFoundToast = useRef(false);

  const { data, isLoading, error } = useQuery(teamDetailOption(teamId));
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

  if (error) return <div>Error: {String(error)}</div>;
  if (!data) return <div>Failed to load data.</div>;

  const youtubeUrl = data.youTubePath ?? '';
  const githubUrl = data.githubPath ?? '';

  return (
    <div className="min-w-xs px-2 sm:px-5">
      <ProjectIntroSection data={data} isEditor={isEditorOfThisTeam} />
      {posterUrl && (
        <>
          <div className="h-10" />
          <section className="from-subGreen/20 to-whiteGray/50 border-lightGray rounded-2xl border bg-gradient-to-br p-3 sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="sm:text-title text-xl font-bold">Poster</h2>
              <span className="text-midGray rounded-full bg-white px-3 py-1 text-xs">Team Poster</span>
            </div>
            <div className="border-lightGray bg-whiteGray/40 relative mx-auto w-full max-w-xl overflow-hidden rounded-xl border">
              <img src={posterUrl} alt={`${data.projectName} poster`} className="w-full object-contain" />
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
        imagesRequired={requiredFields.imagesRequired}
      />
      <div className="h-10" />
      <LikeSection contestId={data.contestId} teamId={data.teamId} isLiked={data.isLiked} isVoted={data.isVoted} />
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
