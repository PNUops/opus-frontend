import { useRef, type ChangeEvent } from 'react';
import { Paperclip } from 'lucide-react';

import type { AdvisorSubmissionFile } from '../types';
import { AdvisorFileList } from './AdvisorFileList';

interface AdvisorFeedbackEditorProps {
  value: string;
  files: AdvisorSubmissionFile[];
  isLoading?: boolean;
  isSaving?: boolean;
  onAttachFiles: (files: File[]) => void;
  onChange: (value: string) => void;
  onDownloadFile: (file: AdvisorSubmissionFile) => void;
  onRemoveFile: (file: AdvisorSubmissionFile) => void;
  onSave: () => void;
}

export const AdvisorFeedbackEditor = ({
  value,
  files,
  isLoading = false,
  isSaving = false,
  onAttachFiles,
  onChange,
  onDownloadFile,
  onRemoveFile,
  onSave,
}: AdvisorFeedbackEditorProps) => {
  const canAttach = !isLoading && !isSaving && files.length < 5;
  const canSave = !isLoading && !isSaving && value.trim().length > 0;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length > 0) {
      onAttachFiles(selectedFiles);
    }

    event.target.value = '';
  };

  return (
    <div className="mt-4 flex flex-col gap-4 rounded-md bg-white p-1 sm:p-4">
      <div className="flex flex-col gap-1">
        <h4 className="text-mainBlue text-sm font-medium">피드백 작성</h4>
        <p className="text-xs leading-5 text-neutral-600">
          제출물을 확인하고 피드백을 작성해주세요. 작성한 피드백은 팀과 관리자에게 공유됩니다.
        </p>
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-neutral-800">첨부한 참고 자료</span>
          <AdvisorFileList
            files={files}
            onDownload={onDownloadFile}
            onRemove={isLoading || isSaving ? undefined : onRemoveFile}
          />
        </div>
      )}

      <label className="sr-only" htmlFor="advisor-feedback-description">
        피드백 내용
      </label>
      <textarea
        id="advisor-feedback-description"
        value={value}
        disabled={isLoading || isSaving}
        onChange={(event) => onChange(event.target.value)}
        placeholder={isLoading ? '피드백을 불러오는 중입니다.' : '제출물에 대한 피드백을 작성해주세요.'}
        className="border-lightGray focus:border-mainBlue disabled:bg-whiteGray h-36 resize-none overflow-y-auto rounded-md border bg-white p-3 text-sm leading-relaxed transition-colors outline-none placeholder:text-neutral-300 disabled:cursor-wait"
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="sr-only"
          tabIndex={-1}
          disabled={!canAttach}
          aria-label="참고 자료 파일"
          onChange={handleFileChange}
        />
        <button
          type="button"
          disabled={!canAttach}
          onClick={() => fileInputRef.current?.click()}
          className="hover:text-mainBlue focus-visible:outline-mainBlue flex min-h-11 w-fit items-center gap-2 rounded-md px-2 text-sm font-medium text-neutral-600 transition-colors focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Paperclip size={16} />
          참고 자료 첨부
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="bg-mainBlue disabled:bg-midGray focus-visible:outline-mainBlue inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-medium text-white transition-colors hover:bg-sky-800 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed"
        >
          {isSaving ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </div>
  );
};
