import { Link } from 'react-router-dom';

import { cn } from '@utils/classname';

import type { AdvisorProject, AdvisorSubmissionFile } from '../types';
import { getAdvisorRoleLabel } from '../utils/format';
import { AdvisorSubmissionPanel } from './AdvisorSubmissionPanel';

interface AdvisorProjectCardProps {
  contestId: number;
  expanded: boolean;
  feedbackDrafts: Record<number, string>;
  isLoadingSubmissions?: boolean;
  project: AdvisorProject;
  savingSubmissionId?: number | null;
  selectedSubmissionId: number | null;
  onAttachFeedbackFiles: (submissionId: number, files: File[]) => void;
  onChangeFeedback: (submissionId: number, value: string) => void;
  onDownloadFile: (file: AdvisorSubmissionFile) => void;
  onRemoveFeedbackFile: (submissionId: number, file: AdvisorSubmissionFile) => void;
  onSaveFeedback: (submissionId: number) => void;
  onSelectSubmission: (submissionId: number) => void;
  onToggle: () => void;
}

export const AdvisorProjectCard = ({
  contestId,
  expanded,
  feedbackDrafts,
  isLoadingSubmissions = false,
  project,
  savingSubmissionId = null,
  selectedSubmissionId,
  onAttachFeedbackFiles,
  onChangeFeedback,
  onDownloadFile,
  onRemoveFeedbackFile,
  onSaveFeedback,
  onSelectSubmission,
  onToggle,
}: AdvisorProjectCardProps) => {
  const hasPendingFeedback = project.pendingFeedbackCount > 0;

  return (
    <article
      className={cn(
        'rounded-lg border border-blue-200 bg-white px-5 py-4 text-sm transition-colors',
        expanded && 'bg-blue-50/20',
      )}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center xl:gap-8">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5 sm:gap-4">
          <span className="text-mainBlue rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold">
            {getAdvisorRoleLabel(project.roleType)}
          </span>
          <h3 className="text-base font-bold text-neutral-950">{project.projectName}</h3>
          <span className="bg-whiteGray rounded-full px-3 py-1 text-xs text-neutral-700">{project.trackName}</span>
          <span className="bg-whiteGray rounded-full px-3 py-1 text-xs text-neutral-700">{project.teamName}</span>
        </div>

        <div className="text-midGray flex items-center gap-2.5 text-xs xl:justify-self-center">
          <span
            className={cn('h-2 w-2 rounded-full', hasPendingFeedback ? 'bg-amber-500' : 'bg-blue-400')}
            aria-hidden
          />
          <span>피드백 작성 대기 {project.pendingFeedbackCount}건</span>
        </div>

        <div className="flex gap-3 xl:justify-self-end">
          <Link
            to={`/contest/${contestId}/teams/view/${project.teamId}`}
            className="border-mainBlue text-mainBlue inline-flex h-10 items-center justify-center rounded-md border px-4 text-center text-sm font-semibold transition-colors hover:bg-blue-50"
          >
            프로젝트 보기
          </Link>
          <button
            type="button"
            onClick={onToggle}
            className="bg-mainBlue inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold text-white transition-colors hover:bg-sky-800"
          >
            피드백 작성
          </button>
        </div>
      </div>

      {expanded && (
        <AdvisorSubmissionPanel
          isLoading={isLoadingSubmissions}
          savingSubmissionId={savingSubmissionId}
          submissions={project.submissions}
          selectedSubmissionId={selectedSubmissionId}
          feedbackDrafts={feedbackDrafts}
          onAttachFeedbackFiles={onAttachFeedbackFiles}
          onChangeFeedback={onChangeFeedback}
          onDownloadFile={onDownloadFile}
          onRemoveFeedbackFile={onRemoveFeedbackFile}
          onSaveFeedback={onSaveFeedback}
          onSelectSubmission={onSelectSubmission}
        />
      )}
    </article>
  );
};
