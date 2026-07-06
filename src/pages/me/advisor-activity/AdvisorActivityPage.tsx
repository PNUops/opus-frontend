import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';

import { getAdvisorFeedbackFile, getAdvisorSubmissionFile, putAdvisorFeedback } from '@apis/advisor';
import useAuth from '@hooks/useAuth';
import { useToast } from '@hooks/useToast';
import {
  advisorContestsOption,
  advisorFeedbackOption,
  advisorProjectsOption,
  advisorTeamSubmissionsOption,
  invalidateAdvisorActivityQueries,
} from '@queries/advisor';
import { downloadBlob } from '@utils/download';

import { AdvisorContestSummary } from './components/AdvisorContestSummary';
import { AdvisorProjectList } from './components/AdvisorProjectList';
import type { AdvisorActivityContest, AdvisorProject, AdvisorSubmissionFile } from './types';

const MAX_FEEDBACK_FILE_COUNT = 5;
let nextLocalFeedbackFileId = -1;

const parseId = (value: string | null | undefined) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

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
  const { contestId: contestIdParam } = useParams<{ contestId?: string }>();
  const [searchParams] = useSearchParams();
  const requestedContestId = parseId(contestIdParam) ?? parseId(searchParams.get('contestId'));

  const { isAdvisor } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<number, string>>({});
  const [pendingFeedbackFiles, setPendingFeedbackFiles] = useState<Record<number, AdvisorSubmissionFile[]>>({});
  const [removedFeedbackFileIds, setRemovedFeedbackFileIds] = useState<Record<number, number[]>>({});

  const advisorContestsQuery = useQuery({
    ...advisorContestsOption(),
    enabled: isAdvisor,
  });
  const advisorContests = useMemo(() => advisorContestsQuery.data ?? [], [advisorContestsQuery.data]);
  const selectedContest = useMemo(() => {
    if (requestedContestId === null) {
      return advisorContests[0] ?? null;
    }

    return advisorContests.find((contest) => contest.contestId === requestedContestId) ?? null;
  }, [advisorContests, requestedContestId]);
  const contestId = selectedContest?.contestId ?? null;

  const advisorProjectsQuery = useQuery({
    ...advisorProjectsOption(contestId ?? 0),
    enabled: isAdvisor && contestId !== null,
  });
  const advisorProjects = useMemo(() => advisorProjectsQuery.data ?? [], [advisorProjectsQuery.data]);

  useEffect(() => {
    const firstProject = advisorProjects[0];

    if (!firstProject) {
      setExpandedTeamId(null);
      return;
    }

    setExpandedTeamId((currentTeamId) => {
      const currentProjectExists = advisorProjects.some((project) => project.teamId === currentTeamId);
      return currentProjectExists ? currentTeamId : firstProject.teamId;
    });
  }, [advisorProjects]);

  const teamSubmissionsQuery = useQuery({
    ...advisorTeamSubmissionsOption(contestId ?? 0, expandedTeamId ?? 0),
    enabled: isAdvisor && contestId !== null && expandedTeamId !== null,
  });
  const teamSubmissions = teamSubmissionsQuery.data;

  useEffect(() => {
    setSelectedSubmissionId((currentSubmissionId) => {
      if (!teamSubmissions?.submissions.length) {
        return null;
      }

      const currentSubmissionExists = teamSubmissions.submissions.some(
        (submission) => submission.submissionId === currentSubmissionId,
      );

      return currentSubmissionExists ? currentSubmissionId : teamSubmissions.submissions[0].submissionId;
    });
  }, [teamSubmissions?.submissions]);

  const advisorFeedbackQuery = useQuery({
    ...advisorFeedbackOption(contestId ?? 0, selectedSubmissionId ?? 0),
    enabled: isAdvisor && contestId !== null && selectedSubmissionId !== null,
  });

  useEffect(() => {
    if (!advisorFeedbackQuery.isSuccess || selectedSubmissionId === null) {
      return;
    }

    setFeedbackDrafts((prev) => ({
      ...prev,
      [selectedSubmissionId]: prev[selectedSubmissionId] ?? advisorFeedbackQuery.data?.description ?? '',
    }));
  }, [advisorFeedbackQuery.data?.description, advisorFeedbackQuery.isSuccess, selectedSubmissionId]);

  const saveFeedbackMutation = useMutation({
    mutationFn: ({
      description,
      files,
      removeFileIds,
      submissionId,
    }: {
      description: string;
      files: File[];
      removeFileIds: number[];
      submissionId: number;
      teamId: number | null;
    }) => {
      if (contestId === null) {
        throw new Error('대회 ID가 필요합니다.');
      }

      return putAdvisorFeedback(contestId, submissionId, { description, files, removeFileIds });
    },
    onSuccess: async (_, { submissionId, teamId }) => {
      if (contestId === null) {
        return;
      }

      setPendingFeedbackFiles((prev) => ({ ...prev, [submissionId]: [] }));
      setRemovedFeedbackFileIds((prev) => ({ ...prev, [submissionId]: [] }));
      await invalidateAdvisorActivityQueries(queryClient, contestId, teamId ?? undefined, submissionId);
      toast('피드백을 저장했어요.', 'success');
    },
    onError: () => {
      toast('피드백 저장에 실패했어요.', 'error');
    },
  });

  const selectedFeedback = advisorFeedbackQuery.data;
  const serverFeedbackFiles = useMemo<AdvisorSubmissionFile[]>(() => {
    if (!selectedFeedback || selectedSubmissionId === null) {
      return [];
    }

    const removedFileIds = new Set(removedFeedbackFileIds[selectedSubmissionId] ?? []);
    return selectedFeedback.files
      .filter((file) => !removedFileIds.has(file.fileId))
      .map((file) => ({
        ...file,
        feedbackId: selectedFeedback.feedbackId,
        source: 'feedback',
        submissionId: selectedSubmissionId,
      }));
  }, [removedFeedbackFileIds, selectedFeedback, selectedSubmissionId]);
  const contestTitle = selectedContest?.contestName ?? '지도 활동';

  const advisorActivity: AdvisorActivityContest = useMemo(() => {
    const projects: AdvisorProject[] = advisorProjects.map((project) => {
      const isExpanded = project.teamId === expandedTeamId;
      const submissions =
        isExpanded && teamSubmissions
          ? teamSubmissions.submissions.map((submission) => {
              const isSelected = submission.submissionId === selectedSubmissionId;
              const pendingFiles = pendingFeedbackFiles[submission.submissionId] ?? [];

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
    pendingFeedbackFiles,
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
        title={requestedContestId === null ? '담당 대회가 없습니다.' : '담당 대회를 찾지 못했습니다.'}
        description={
          requestedContestId === null
            ? '지도 활동을 확인할 담당 대회가 없습니다.'
            : '선택한 대회의 지도 활동 권한을 확인할 수 없습니다.'
        }
      />
    );
  }

  const handleToggleProject = (project: AdvisorProject) => {
    if (expandedTeamId === project.teamId) {
      setExpandedTeamId(null);
      setSelectedSubmissionId(null);
      return;
    }

    setExpandedTeamId(project.teamId);
    setSelectedSubmissionId(null);
  };

  const handleChangeFeedback = (submissionId: number, value: string) => {
    setFeedbackDrafts((prev) => ({ ...prev, [submissionId]: value }));
  };

  const handleAttachFeedbackFiles = (submissionId: number, files: File[]) => {
    const removedFileCount = removedFeedbackFileIds[submissionId]?.length ?? 0;
    const serverFileCount =
      submissionId === selectedSubmissionId ? Math.max(0, (selectedFeedback?.files.length ?? 0) - removedFileCount) : 0;

    setPendingFeedbackFiles((prev) => {
      const currentFiles = prev[submissionId] ?? [];
      const availableSlots = Math.max(0, MAX_FEEDBACK_FILE_COUNT - serverFileCount - currentFiles.length);
      const validFiles = files.filter((file) => file.size > 0).slice(0, availableSlots);

      if (validFiles.length === 0) {
        toast('피드백 첨부파일은 최대 5개까지 첨부할 수 있어요.', 'error');
        return prev;
      }

      return {
        ...prev,
        [submissionId]: [...currentFiles, ...createLocalFeedbackFiles(submissionId, validFiles)],
      };
    });
  };

  const handleRemoveFeedbackFile = (submissionId: number, file: AdvisorSubmissionFile) => {
    if (file.source === 'local') {
      setPendingFeedbackFiles((prev) => ({
        ...prev,
        [submissionId]: (prev[submissionId] ?? []).filter((pendingFile) => pendingFile.fileId !== file.fileId),
      }));
      return;
    }

    if (file.source === 'feedback') {
      setRemovedFeedbackFileIds((prev) => ({
        ...prev,
        [submissionId]: Array.from(new Set([...(prev[submissionId] ?? []), file.fileId])),
      }));
    }
  };

  const handleSaveFeedback = (submissionId: number) => {
    const description = feedbackDrafts[submissionId]?.trim();

    if (!description) {
      toast('피드백 본문을 입력해주세요.', 'error');
      return;
    }

    saveFeedbackMutation.mutate({
      description,
      files: (pendingFeedbackFiles[submissionId] ?? [])
        .map((file) => file.sourceFile)
        .filter((file): file is File => file !== undefined),
      removeFileIds: removedFeedbackFileIds[submissionId] ?? [],
      submissionId,
      teamId: expandedTeamId,
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

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
      <AdvisorContestSummary contest={advisorActivity} />
      <AdvisorProjectList
        contestId={advisorActivity.contestId}
        projects={advisorActivity.projects}
        expandedTeamId={expandedTeamId}
        loadingTeamId={teamSubmissionsQuery.isLoading ? expandedTeamId : null}
        savingSubmissionId={saveFeedbackMutation.isPending ? saveFeedbackMutation.variables?.submissionId : null}
        selectedSubmissionId={selectedSubmissionId}
        feedbackDrafts={feedbackDrafts}
        onAttachFeedbackFiles={handleAttachFeedbackFiles}
        onChangeFeedback={handleChangeFeedback}
        onDownloadFile={handleDownloadFile}
        onRemoveFeedbackFile={handleRemoveFeedbackFile}
        onSaveFeedback={handleSaveFeedback}
        onSelectSubmission={setSelectedSubmissionId}
        onToggleProject={handleToggleProject}
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
