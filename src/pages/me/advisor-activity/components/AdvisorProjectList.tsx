import type { AdvisorProject, AdvisorSubmissionFile } from '../types';
import { AdvisorProjectCard } from './AdvisorProjectCard';

interface AdvisorProjectListProps {
  notificationTeamId: number | null;
  contestId: number;
  expandedTeamId: number | null;
  feedbackDrafts: Record<number, string>;
  loadingTeamId?: number | null;
  projects: AdvisorProject[];
  savingSubmissionId?: number | null;
  selectedSubmissionId: number | null;
  onAttachFeedbackFiles: (submissionId: number, files: File[]) => void;
  onChangeFeedback: (submissionId: number, value: string) => void;
  onDownloadFile: (file: AdvisorSubmissionFile) => void;
  onRemoveFeedbackFile: (submissionId: number, file: AdvisorSubmissionFile) => void;
  onSaveFeedback: (submissionId: number) => void;
  onSelectSubmission: (submissionId: number) => void;
  onToggleProject: (project: AdvisorProject) => void;
}

export const AdvisorProjectList = ({
  notificationTeamId,
  contestId,
  expandedTeamId,
  feedbackDrafts,
  loadingTeamId = null,
  projects,
  savingSubmissionId = null,
  selectedSubmissionId,
  onAttachFeedbackFiles,
  onChangeFeedback,
  onDownloadFile,
  onRemoveFeedbackFile,
  onSaveFeedback,
  onSelectSubmission,
  onToggleProject,
}: AdvisorProjectListProps) => {
  const { key: navigationKey } = useLocation();
  const targetRef = useRef<HTMLElement>(null);
  const scrolledKey = useRef<string | null>(null);
  const targetTeamId = projects.find((project) => project.teamId === notificationTeamId)?.teamId ?? null;

  useEffect(() => {
    if (targetTeamId === null || loadingTeamId === targetTeamId || scrolledKey.current === navigationKey) return;
    let cancelled = false;
    const frame = requestAnimationFrame(async () => {
      await document.fonts.ready;
      if (cancelled) return;
      const target = targetRef.current;
      if (!target) return;
      const transitions =
        target.parentElement
          ?.getAnimations({ subtree: true })
          .filter(
            (animation) => animation instanceof CSSTransition && animation.transitionProperty === 'grid-template-rows',
          ) ?? [];
      await Promise.all(transitions.map((animation) => animation.finished.catch(() => undefined)));
      if (cancelled) return;
      scrolledKey.current = navigationKey;
      target.scrollIntoView({
        block: 'start',
        inline: 'nearest',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [navigationKey, targetTeamId, loadingTeamId]);

  if (projects.length === 0) {
    return (
      <section className="border-lightGray text-midGray flex min-h-45 items-center justify-center rounded-lg border bg-white text-sm font-medium">
        담당 프로젝트가 없습니다.
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-5" aria-label="담당 프로젝트">
      <h2 className="text-2xl font-extrabold text-neutral-950">담당 프로젝트</h2>
      <div className="flex flex-col gap-4">
        {projects.map((project) => (
          <AdvisorProjectCard
            targetRef={project.teamId === targetTeamId ? targetRef : undefined}
            key={project.teamId}
            contestId={contestId}
            project={project}
            expanded={project.teamId === expandedTeamId}
            isLoadingSubmissions={loadingTeamId === project.teamId}
            savingSubmissionId={savingSubmissionId}
            selectedSubmissionId={selectedSubmissionId}
            feedbackDrafts={feedbackDrafts}
            onAttachFeedbackFiles={onAttachFeedbackFiles}
            onChangeFeedback={onChangeFeedback}
            onDownloadFile={onDownloadFile}
            onRemoveFeedbackFile={onRemoveFeedbackFile}
            onSaveFeedback={onSaveFeedback}
            onSelectSubmission={onSelectSubmission}
            onToggle={() => onToggleProject(project)}
          />
        ))}
      </div>
    </section>
  );
};
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
