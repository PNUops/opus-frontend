import { useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';

import { getAdvisorFeedbackFile, getAdvisorSubmissionFile, putAdvisorFeedback } from '@apis/advisor';
import useAuth from '@hooks/useAuth';
import { useToast } from '@hooks/useToast';
import { advisorFeedbackOption, invalidateAdvisorActivityQueries } from '@queries/advisor';
import { downloadBlob } from '@utils/download';

import { AdvisorContestSummary } from './components/AdvisorContestSummary';
import { AdvisorProjectList } from './components/AdvisorProjectList';
import { useAdvisorSelection } from './hooks/useAdvisorSelection';
import type { AdvisorActivityContest, AdvisorProject, AdvisorSubmissionFile } from './types';

const MAX_FEEDBACK_FILE_COUNT = 5;
type FeedbackEdit = { description?: string; files: AdvisorSubmissionFile[]; removeFileIds: number[] };
const EMPTY_FEEDBACK_EDIT: FeedbackEdit = { files: [], removeFileIds: [] };
const feedbackEditKey = (contestId: number | null, teamId: number | null, submissionId: number) =>
  `${contestId}:${teamId}:${submissionId}`;
let nextLocalFeedbackFileId = -1;

const createLocalFeedbackFiles = (submissionId: number, files: File[]): AdvisorSubmissionFile[] =>
  files.map((file) => ({
    fileId: nextLocalFeedbackFileId--,
    fileName: file.name,
    fileSize: file.size,
    source: 'local',
    sourceFile: file,
    submissionId,
  }));

const AdvisorActivityPage = () => {
  const { isAdvisor } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    requestedContestId,
    requestedTeamId,
    selectedContest,
    contestId,
    advisorContestsQuery,
    advisorProjectsQuery,
    advisorProjects,
    teamSubmissionsQuery,
    teamSubmissions,
    expandedTeamId,
    selectedSubmissionId,
    toggleTeam,
    selectSubmission,
  } = useAdvisorSelection(isAdvisor);
  // 페이지가 마운트된 동안 대회·팀·제출물별 초안과 첨부파일을 보존한다.
  const [feedbackEdits, setFeedbackEdits] = useState<Record<string, FeedbackEdit>>({});
  const pendingKeysRef = useRef(new Set<string>());
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(() => new Set());

  const advisorFeedbackQuery = useQuery({
    ...advisorFeedbackOption(contestId ?? 0, selectedSubmissionId ?? 0),
    enabled: isAdvisor && contestId !== null && selectedSubmissionId !== null,
  });

  const saveFeedbackMutation = useMutation({
    mutationFn: ({
      description,
      files,
      removeFileIds,
      submissionId,
      contestId: targetContestId,
    }: {
      description: string;
      files: File[];
      removeFileIds: number[];
      submissionId: number;
      teamId: number;
      contestId: number;
      editKey: string;
      uploadedFileIds: number[];
    }) => {
      return putAdvisorFeedback(targetContestId, submissionId, { description, files, removeFileIds });
    },
    onSuccess: async (
      _,
      { contestId: targetContestId, submissionId, teamId, editKey, uploadedFileIds, removeFileIds },
    ) => {
      setFeedbackEdits((prev) => {
        const edit = prev[editKey];
        if (!edit) return prev;
        return {
          ...prev,
          [editKey]: {
            ...edit,
            files: edit.files.filter((file) => !uploadedFileIds.includes(file.fileId)),
            removeFileIds: edit.removeFileIds.filter((id) => !removeFileIds.includes(id)),
          },
        };
      });
      await invalidateAdvisorActivityQueries(queryClient, targetContestId, teamId, submissionId);
      toast('피드백을 저장했어요.', 'success');
    },
    onError: () => {
      toast('피드백 저장에 실패했어요.', 'error');
    },
    onSettled: (_data, _error, { editKey }) => {
      pendingKeysRef.current.delete(editKey);
      setPendingKeys(new Set(pendingKeysRef.current));
    },
  });

  const selectedFeedback = advisorFeedbackQuery.isSuccess ? advisorFeedbackQuery.data : undefined;
  const selectedEdit =
    selectedSubmissionId === null
      ? EMPTY_FEEDBACK_EDIT
      : (feedbackEdits[feedbackEditKey(contestId, expandedTeamId, selectedSubmissionId)] ?? EMPTY_FEEDBACK_EDIT);
  const feedbackDrafts =
    selectedSubmissionId === null
      ? {}
      : {
          [selectedSubmissionId]: selectedEdit.description ?? selectedFeedback?.description ?? '',
        };
  const serverFeedbackFiles = useMemo<AdvisorSubmissionFile[]>(() => {
    if (!selectedFeedback || selectedSubmissionId === null) {
      return [];
    }

    const removedFileIds = new Set(selectedEdit.removeFileIds);
    return selectedFeedback.files
      .filter((file) => !removedFileIds.has(file.fileId))
      .map((file) => ({
        ...file,
        feedbackId: selectedFeedback.feedbackId,
        source: 'feedback',
        submissionId: selectedSubmissionId,
      }));
  }, [selectedEdit.removeFileIds, selectedFeedback, selectedSubmissionId]);
  const contestTitle = selectedContest?.contestName ?? '지도 활동';

  const advisorActivity: AdvisorActivityContest = useMemo(() => {
    const projects: AdvisorProject[] = advisorProjects.map((project) => {
      const isExpanded = project.teamId === expandedTeamId;
      const submissions =
        isExpanded && teamSubmissions
          ? teamSubmissions.submissions.map((submission) => {
              const isSelected = submission.submissionId === selectedSubmissionId;
              const pendingFiles =
                feedbackEdits[feedbackEditKey(contestId, project.teamId, submission.submissionId)]?.files ?? [];

              return {
                ...submission,
                feedbackFiles: isSelected ? [...serverFeedbackFiles, ...pendingFiles] : pendingFiles,
                files: submission.files.map((file) => ({
                  ...file,
                  source: 'submission' as const,
                  submissionId: submission.submissionId,
                })),
                isFeedbackLoading: isSelected && advisorFeedbackQuery.isLoading,
              };
            })
          : [];

      return { ...project, submissions };
    });

    const contestTags =
      selectedContest === null
        ? ['대회 미선택']
        : Array.from(new Set([selectedContest.categoryName, ...selectedContest.assignedTrackNames])).filter(Boolean);

    return {
      assignedTeamCount: selectedContest?.totalAssignedTeamCount ?? projects.length,
      contestId: contestId ?? 0,
      contestName: contestTitle,
      pendingFeedbackCount:
        selectedContest?.totalPendingFeedbackCount ??
        projects.reduce((total, project) => total + project.pendingFeedbackCount, 0),
      projects,
      tags: contestTags,
    };
  }, [
    advisorProjects,
    advisorFeedbackQuery.isLoading,
    contestId,
    contestTitle,
    expandedTeamId,
    feedbackEdits,
    selectedSubmissionId,
    selectedContest,
    serverFeedbackFiles,
    teamSubmissions,
  ]);

  if (!isAdvisor) {
    return (
      <div className="border-lightGray mx-auto flex min-h-60 w-full max-w-6xl flex-col items-center justify-center gap-2 rounded-lg border bg-white px-6 text-center">
        <h2 className="text-base font-bold text-neutral-900">접근 권한이 없습니다.</h2>
        <p className="text-midGray text-sm">지도교수 또는 외부 멘토만 지도 활동을 확인할 수 있습니다.</p>
      </div>
    );
  }

  if (advisorContestsQuery.isLoading) {
    return <AdvisorActivitySkeleton />;
  }

  if (advisorContestsQuery.isError) {
    return (
      <AdvisorActivityMessage
        title="담당 대회 정보를 불러오지 못했습니다."
        description="잠시 후 다시 시도해주세요."
        onRetry={() => void advisorContestsQuery.refetch()}
      />
    );
  }

  if (contestId === null) {
    return (
      <AdvisorActivityMessage
        title={requestedContestId === undefined ? '담당 대회가 없습니다.' : '담당 대회를 찾지 못했습니다.'}
        description={
          requestedContestId === undefined
            ? '지도 활동을 확인할 담당 대회가 없습니다.'
            : '선택한 대회의 지도 활동 권한을 확인할 수 없습니다.'
        }
      />
    );
  }

  const updateFeedbackEdit = (submissionId: number, update: (edit: FeedbackEdit) => FeedbackEdit) => {
    if (expandedTeamId === null || submissionId !== selectedSubmissionId || !advisorFeedbackQuery.isSuccess) return;
    const key = feedbackEditKey(contestId, expandedTeamId, submissionId);
    if (pendingKeysRef.current.has(key)) return;
    setFeedbackEdits((prev) => ({ ...prev, [key]: update(prev[key] ?? EMPTY_FEEDBACK_EDIT) }));
  };
  const handleChangeFeedback = (submissionId: number, value: string) => {
    updateFeedbackEdit(submissionId, (edit) => ({ ...edit, description: value }));
  };

  const handleAttachFeedbackFiles = (submissionId: number, files: File[]) => {
    const availableSlots = Math.max(
      0,
      MAX_FEEDBACK_FILE_COUNT - serverFeedbackFiles.length - selectedEdit.files.length,
    );
    const validFiles = files.filter((file) => file.size > 0).slice(0, availableSlots);
    if (validFiles.length === 0) {
      toast('피드백 첨부파일은 최대 5개까지 첨부할 수 있어요.', 'error');
      return;
    }
    const localFiles = createLocalFeedbackFiles(submissionId, validFiles);
    updateFeedbackEdit(submissionId, (edit) => ({ ...edit, files: [...edit.files, ...localFiles] }));
  };

  const handleRemoveFeedbackFile = (submissionId: number, file: AdvisorSubmissionFile) => {
    if (file.source === 'local') {
      updateFeedbackEdit(submissionId, (edit) => ({
        ...edit,
        files: edit.files.filter((pendingFile) => pendingFile.fileId !== file.fileId),
      }));
      return;
    }

    if (file.source === 'feedback') {
      updateFeedbackEdit(submissionId, (edit) => ({
        ...edit,
        removeFileIds: Array.from(new Set([...edit.removeFileIds, file.fileId])),
      }));
    }
  };

  const handleSaveFeedback = (submissionId: number) => {
    if (expandedTeamId === null || submissionId !== selectedSubmissionId || !advisorFeedbackQuery.isSuccess) return;
    const editKey = feedbackEditKey(contestId, expandedTeamId, submissionId);
    if (pendingKeysRef.current.has(editKey)) return;
    const description = feedbackDrafts[submissionId]?.trim();

    if (!description) {
      toast('피드백 본문을 입력해주세요.', 'error');
      return;
    }

    pendingKeysRef.current.add(editKey);
    setPendingKeys(new Set(pendingKeysRef.current));
    saveFeedbackMutation.mutate({
      description,
      files: selectedEdit.files.map((file) => file.sourceFile).filter((file): file is File => file !== undefined),
      removeFileIds: selectedEdit.removeFileIds,
      submissionId,
      teamId: expandedTeamId,
      contestId,
      editKey,
      uploadedFileIds: selectedEdit.files.map((file) => file.fileId),
    });
  };

  const handleDownloadFile = async (file: AdvisorSubmissionFile) => {
    if (file.sourceFile) {
      downloadBlob(file.sourceFile, file.fileName);
      return;
    }

    if (!file.submissionId) {
      toast('파일 정보를 확인할 수 없어요.', 'error');
      return;
    }

    try {
      const res =
        file.source === 'feedback' && file.feedbackId
          ? await getAdvisorFeedbackFile(contestId, file.submissionId, file.feedbackId, file.fileId)
          : await getAdvisorSubmissionFile(contestId, file.submissionId, file.fileId);

      downloadBlob(res.data, file.fileName, res.headers['content-disposition']);
    } catch {
      toast('파일 다운로드에 실패했어요.', 'error');
    }
  };

  if (advisorProjectsQuery.isLoading) {
    return <AdvisorActivitySkeleton />;
  }

  if (advisorProjectsQuery.isError) {
    return (
      <AdvisorActivityMessage
        title="지도 활동을 불러오지 못했습니다."
        description="잠시 후 다시 시도해주세요."
        onRetry={() => void advisorProjectsQuery.refetch()}
      />
    );
  }

  if (expandedTeamId !== null && (teamSubmissionsQuery.isError || advisorFeedbackQuery.isError)) {
    return (
      <AdvisorActivityMessage
        title="제출물 또는 피드백을 불러오지 못했습니다."
        description="담당 팀 접근 권한을 확인하거나 잠시 후 다시 시도해주세요."
        onRetry={() =>
          void (teamSubmissionsQuery.isError ? teamSubmissionsQuery.refetch() : advisorFeedbackQuery.refetch())
        }
      />
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
      <AdvisorContestSummary contest={advisorActivity} />
      <AdvisorProjectList
        notificationTeamId={requestedTeamId ?? null}
        contestId={advisorActivity.contestId}
        projects={advisorActivity.projects}
        expandedTeamId={expandedTeamId}
        loadingTeamId={teamSubmissionsQuery.isLoading ? expandedTeamId : null}
        savingSubmissionId={
          selectedSubmissionId !== null &&
          pendingKeys.has(feedbackEditKey(contestId, expandedTeamId, selectedSubmissionId))
            ? selectedSubmissionId
            : null
        }
        selectedSubmissionId={selectedSubmissionId}
        feedbackDrafts={feedbackDrafts}
        onAttachFeedbackFiles={handleAttachFeedbackFiles}
        onChangeFeedback={handleChangeFeedback}
        onDownloadFile={handleDownloadFile}
        onRemoveFeedbackFile={handleRemoveFeedbackFile}
        onSaveFeedback={handleSaveFeedback}
        onSelectSubmission={selectSubmission}
        onToggleProject={(project) => toggleTeam(project.teamId)}
      />
    </div>
  );
};

export default AdvisorActivityPage;

const AdvisorActivityMessage = ({
  description,
  onRetry,
  title,
}: {
  description: string;
  onRetry?: () => void;
  title: string;
}) => (
  <div className="border-lightGray mx-auto flex min-h-60 w-full max-w-6xl flex-col items-center justify-center gap-3 rounded-lg border bg-white px-6 text-center">
    <h2 className="text-base font-bold text-neutral-900">{title}</h2>
    <p className="text-midGray text-sm">{description}</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="border-lightGray hover:bg-whiteGray inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold text-neutral-800 transition-colors"
      >
        <RefreshCw size={16} />
        다시 시도
      </button>
    )}
  </div>
);

const AdvisorActivitySkeleton = () => (
  <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
    <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-3">
        <div className="h-8 w-48 animate-pulse rounded-md bg-neutral-200" />
        <div className="flex gap-2">
          <div className="h-6 w-20 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-neutral-200" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 lg:min-w-[24rem] lg:gap-10">
        <div className="h-24 animate-pulse rounded-md bg-neutral-200" />
        <div className="h-24 animate-pulse rounded-md bg-neutral-200" />
      </div>
    </div>
    <section className="flex flex-col gap-5">
      <div className="h-8 w-36 animate-pulse rounded-md bg-neutral-200" />
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="h-20 animate-pulse rounded-lg bg-neutral-200" />
      ))}
    </section>
  </div>
);
