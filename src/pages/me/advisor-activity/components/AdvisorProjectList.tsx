import type { AdvisorProject, AdvisorSubmissionFile } from '../types';
import { AdvisorProjectCard } from './AdvisorProjectCard';

interface AdvisorProjectListProps {
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
