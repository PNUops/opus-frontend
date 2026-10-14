import { deleteSubmissionFile, postSubmission, postSubmissionFiles } from '@apis/submission';

interface SubmissionChanges {
  contestId: number;
  submissionItemId: number;
  teamId: number;
  submissionId: number | null;
  existingFileCount: number;
  maxFileCount: number;
  deletedFileIds: number[];
  newFiles: File[];
}

/** 개수 제한을 지키면서 가능한 한 제출물에 파일을 남겨 두고 교체한다. */
export const saveSubmissionChanges = async ({
  contestId,
  submissionItemId,
  teamId,
  submissionId,
  existingFileCount,
  maxFileCount,
  deletedFileIds,
  newFiles,
}: SubmissionChanges) => {
  let savedSubmissionId = submissionId;
  let fileCount = existingFileCount;
  const pendingDeletes = [...deletedFileIds];
  let pendingFiles = newFiles;

  const removeFile = async (fileId: number) => {
    await deleteSubmissionFile(contestId, savedSubmissionId!, fileId);
    fileCount -= 1;
  };

  const uploadFiles = async (count: number) => {
    const files = pendingFiles.slice(0, count);
    if (savedSubmissionId === null || fileCount === 0) {
      const result = await postSubmission(contestId, submissionItemId, teamId, files);
      savedSubmissionId = result.submissionId;
    } else {
      await postSubmissionFiles(contestId, savedSubmissionId, files);
    }
    fileCount += files.length;
    pendingFiles = pendingFiles.slice(count);
  };

  if (pendingFiles.length > 0) {
    // 업로드 공간을 확보하되 마지막 기존 파일은 새 파일이 올라갈 때까지 유지한다.
    const spaceNeeded = Math.max(0, fileCount + pendingFiles.length - maxFileCount);
    const deleteFirstCount = Math.min(spaceNeeded, Math.max(0, fileCount - 1), pendingDeletes.length);
    for (let i = 0; i < deleteFirstCount; i += 1) {
      await removeFile(pendingDeletes.shift()!);
    }

    const firstBatchSize = Math.min(pendingFiles.length, maxFileCount - fileCount);
    if (firstBatchSize > 0) await uploadFiles(firstBatchSize);
  }

  for (const fileId of pendingDeletes) {
    await removeFile(fileId);
  }
  // 최대 1개인 항목의 교체는 마지막 파일 삭제 후 새 제출물을 생성해야 한다.
  if (pendingFiles.length > 0) await uploadFiles(pendingFiles.length);

  return fileCount === 0 ? null : savedSubmissionId;
};
