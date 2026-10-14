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
  if (existingFileCount - deletedFileIds.length + newFiles.length < 1) {
    throw new Error('제출 파일을 최소 1개 남겨주세요.');
  }
  if (submissionId !== null && maxFileCount === 1 && deletedFileIds.length > 0 && newFiles.length > 0) {
    throw new Error('파일 1개 제한 항목은 기존 제출물을 유지하며 교체할 수 없어요.');
  }

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
    if (savedSubmissionId === null) {
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
  if (pendingFiles.length > 0) await uploadFiles(pendingFiles.length);

  return savedSubmissionId;
};
