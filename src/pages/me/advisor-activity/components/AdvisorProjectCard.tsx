import type { Ref } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

import { cn } from '@utils/classname';

import type { AdvisorProject, AdvisorSubmissionFile } from '../types';
import { getAdvisorRoleLabel } from '../utils/format';
import { AdvisorSubmissionPanel } from './AdvisorSubmissionPanel';

interface AdvisorProjectCardProps {
  targetRef?: Ref<HTMLElement>;
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
  targetRef,
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
      ref={targetRef}
      className={cn(
        'scroll-mt-4 rounded-lg border border-blue-200 bg-white px-3 py-4 text-sm transition-colors xl:px-5',
        expanded && 'bg-blue-50/20',
      )}
    >
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto_auto] xl:items-center xl:gap-8">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5 sm:gap-4">
          <span className="text-mainBlue rounded-md bg-blue-50 px-3 py-1.5 text-xs font-bold">
            {getAdvisorRoleLabel(project.roleType)}
          </span>
          <h3 className="min-w-0 text-base leading-6 font-semibold break-words text-neutral-950">
            {project.projectName}
          </h3>
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

        <div className="flex flex-wrap gap-3 xl:justify-self-end">
          <Link
            to={`/contest/${contestId}/teams/view/${project.teamId}`}
            className="border-mainBlue text-mainBlue focus-visible:outline-mainBlue inline-flex min-h-11 items-center justify-center rounded-md border px-3 text-center text-sm font-medium transition-colors hover:bg-blue-50 focus-visible:outline-2"
          >
            프로젝트 보기
          </Link>
          <button
            type="button"
            onClick={onToggle}
            className="border-mainBlue text-mainBlue focus-visible:outline-mainBlue inline-flex min-h-11 items-center justify-center rounded-md border px-3 text-center text-sm font-medium transition-colors hover:bg-blue-50 focus-visible:outline-2"
            aria-expanded={expanded}
          >
            피드백 작성
            <ChevronDown className={cn('ml-2 size-4 transition-transform duration-300', expanded && 'rotate-180')} />
          </button>
        </div>
      </div>

      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity] duration-300 ease-out',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
        aria-hidden={!expanded}
        inert={!expanded}
      >
        <div
          className={cn(
            'min-h-0 overflow-hidden transition-transform duration-300 ease-out',
            expanded ? 'translate-y-0' : '-translate-y-2',
          )}
        >
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
        </div>
      </div>
    </article>
  );
};
