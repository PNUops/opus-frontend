import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { CalendarDays, Eye, FileCheck, FileText, UploadCloud, X } from 'lucide-react';

import { AdminActionButton } from '@components/admin';
import { DialogClose, DialogContent, DialogTitle } from '@components/ui/dialog';
import { useToast } from '@hooks/useToast';
import { submissionKeys } from '@queries/submission';
import { getApiErrorMessage } from '@utils/error';
import { getFileFormatExtensions, VISIBILITY_LABEL } from '@constants/submission';
import type { SubmissionFileResponseDto, SubmissionItemSettingResponseDto } from '@dto/submissionDto';

import { saveSubmissionChanges } from '../utils/saveSubmissionChanges';

const getExtension = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex < 0 ? '' : fileName.slice(dotIndex).toLowerCase();
};

const formatDateTimeWithDay = (value: string) => dayjs(value).locale('ko').format('YYYY.MM.DD (ddd) HH:mm');
const formatFileSize = (bytes: number) => {
  const mb = bytes / 1024 / 1024;
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)}GB` : `${mb.toFixed(1)}MB`;
};

interface SubmissionUploadModalProps {
  /** 공모전 ID (제출/파일 API 경로) */
  contestId: number;
  /** 제출 항목 ID (최초 제출 시 사용) */
  submissionItemId: number;
  /** 팀 ID (제출 시 쿼리 파라미터로 전달) */
  teamId: number;
  /** 기존 제출 ID — null이면 최초 제출, 값이 있으면 파일 추가/삭제 */
  submissionId: number | null;
  submissionItemName: string;
  description: string;
  /** 제출물 설정값 (설정값 확인 API) — 시작/마감일시, 지각 제출, 공개 범위, 파일 제약 */
  setting: SubmissionItemSettingResponseDto;
  /** 기존 제출 파일 (재제출 시) */
  existingFiles: SubmissionFileResponseDto[];
  onClose: () => void;
  /** 제출/파일 변경 성공 시 (부모 목록 갱신 등) */
  onSuccess?: () => void;
}

export const SubmissionUploadModal = ({
  contestId,
  submissionItemId,
  teamId,
  submissionId,
  submissionItemName,
  description,
  setting,
  existingFiles,
  onClose,
  onSuccess,
}: SubmissionUploadModalProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const savingRef = useRef(false);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedFileIds, setDeletedFileIds] = useState<number[]>([]);

  const retainedFiles = existingFiles.filter((file) => !deletedFileIds.includes(file.fileId));

  const allowedFormats = getFileFormatExtensions(setting.allowedFileFormats);
  const maxSizeBytes = setting.maxFileSizeMb * 1024 * 1024;
  const totalCount = retainedFiles.length + newFiles.length;
  const remaining = Math.max(0, setting.maxFileCount - totalCount);
  const hasChanges = newFiles.length > 0 || deletedFileIds.length > 0;
  const isReplacementBlocked =
    submissionId !== null && setting.maxFileCount === 1 && deletedFileIds.length > 0 && newFiles.length > 0;

  const invalidateSubmissions = async (savedSubmissionId?: number | null) => {
    const keys: (readonly (string | number)[])[] = [
      submissionKeys.myList(contestId, teamId),
      submissionKeys.mySummary(contestId, teamId),
      submissionKeys.myTimeline(contestId, teamId),
      submissionKeys.statuses(contestId),
      submissionKeys.downloads(contestId),
    ];
    if (submissionId !== null) {
      keys.push(submissionKeys.detail(contestId, submissionId));
    }
    if (savedSubmissionId != null && savedSubmissionId !== submissionId) {
      keys.push(submissionKeys.detail(contestId, savedSubmissionId));
    }
    await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      saveSubmissionChanges({
        contestId,
        submissionItemId,
        teamId,
        submissionId,
        existingFileCount: existingFiles.length,
        maxFileCount: setting.maxFileCount,
        deletedFileIds,
        newFiles,
      }),
    onSuccess: () => {
      toast('제출물을 저장했어요.', 'success');
    },
    onError: (error) => {
      toast(
        `${getApiErrorMessage(error, '저장에 실패했어요.')} 일부 변경이 반영되었을 수 있어요. 최신 목록을 확인한 뒤 다시 수정해주세요.`,
        'error',
      );
    },
    onSettled: async (savedSubmissionId, error) => {
      try {
        await invalidateSubmissions(savedSubmissionId);
        if (!error) onSuccess?.();
      } finally {
        // 응답 유실이나 중간 실패 후 같은 요청을 재전송하지 않도록 초안을 폐기한다.
        savingRef.current = false;
        onClose();
      }
    },
  });

  const isSaving = saveMutation.isPending;

  const handleSave = () => {
    if (savingRef.current) return;
    if (isReplacementBlocked) {
      toast('파일 1개 제한 항목은 기존 제출물을 유지하며 교체할 수 없어요.', 'error');
      return;
    }
    if (!hasChanges) {
      toast(submissionId === null ? '첨부할 파일을 선택해주세요.' : '변경할 파일을 추가하거나 삭제해주세요.', 'error');
      return;
    }
    if (totalCount === 0) {
      toast('제출 파일을 최소 1개 남겨주세요.', 'error');
      return;
    }
    const now = dayjs();
    if (now.isBefore(dayjs(setting.startAt))) {
      toast('아직 제출 기간이 시작되지 않았어요.', 'error');
      return;
    }
    if (!setting.allowLateSubmission && now.isAfter(dayjs(setting.endAt))) {
      toast('제출 기간이 마감되었어요.', 'error');
      return;
    }
    if (totalCount > setting.maxFileCount) {
      toast(`파일은 최대 ${setting.maxFileCount}개까지 첨부할 수 있어요.`, 'error');
      return;
    }
    savingRef.current = true;
    saveMutation.mutate();
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || savingRef.current) return;

    // 형식·크기 검증 (위반 파일은 제외하고 안내)
    const valid = Array.from(fileList).filter((file) => {
      if (allowedFormats.length > 0 && !allowedFormats.includes(getExtension(file.name))) {
        toast(`${file.name}은(는) 허용되지 않는 파일 형식이에요.`, 'error');
        return false;
      }
      if (file.size > maxSizeBytes) {
        toast(`${file.name}은(는) 최대 크기 ${setting.maxFileSizeMb}MB를 초과했어요.`, 'error');
        return false;
      }
      return true;
    });

    // 개수 제한
    if (valid.length > remaining) {
      toast(`파일은 최대 ${setting.maxFileCount}개까지 첨부할 수 있어요.`, 'error');
    }
    const picked = valid.slice(0, remaining);
    if (picked.length > 0) setNewFiles((prev) => [...prev, ...picked]);
  };

  const removeNewFile = (index: number) => {
    if (savingRef.current) return;
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <DialogContent
      className="flex max-h-[calc(100dvh-2rem)] w-[600px] max-w-[calc(100vw-2rem)] items-stretch gap-0 overflow-hidden rounded-xl p-0 pt-0 pr-0 [&>button]:top-2 [&>button]:right-2 [&>button]:flex [&>button]:size-11 [&>button]:items-center [&>button]:justify-center"
      closeDisabled={isSaving}
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        // 파일 선택 버튼에 자동 포커스되면 긴 설명의 시작 부분이 스크롤되어 가려진다.
        titleRef.current?.focus({ preventScroll: true });
      }}
      onEscapeKeyDown={(event) => {
        if (savingRef.current) event.preventDefault();
      }}
      onInteractOutside={(event) => {
        if (savingRef.current) event.preventDefault();
      }}
    >
      <div className="shrink-0 px-5 py-4 pr-16 sm:px-6 sm:pr-16">
        <DialogTitle
          ref={titleRef}
          tabIndex={-1}
          className="text-xl leading-7 font-semibold text-gray-900 outline-none"
        >
          제출물 업로드
        </DialogTitle>
      </div>

      <div className="flex min-h-0 flex-col gap-5 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6">
        {/* 제출물 정보 */}
        <div className="flex flex-col gap-1">
          <h4 className="text-base leading-6 font-semibold [overflow-wrap:anywhere] text-gray-900">
            {submissionItemName}
          </h4>
          <p className="text-sm leading-6 [overflow-wrap:anywhere] whitespace-pre-wrap text-gray-600">{description}</p>
        </div>

        <div className="flex flex-col gap-2.5">
          <InfoItem icon={<CalendarDays size={16} />} label="시작일시" value={formatDateTimeWithDay(setting.startAt)} />
          <InfoItem icon={<CalendarDays size={16} />} label="마감일시" value={formatDateTimeWithDay(setting.endAt)} />
          <InfoItem
            icon={<FileCheck size={16} />}
            label="지각 제출"
            value={setting.allowLateSubmission ? '허용함' : '허용 안 함'}
          />
          <InfoItem icon={<Eye size={16} />} label="공개 범위" value={VISIBILITY_LABEL[setting.visibility]} />
        </div>

        {/* 제약 박스 */}
        <ul className="bg-subGreen/40 flex list-disc flex-col gap-1 rounded-lg py-3 pr-4 pl-8 text-sm leading-5 [overflow-wrap:anywhere] text-green-800">
          <li>파일 형식: {allowedFormats.join(', ') || '제한 없음'}</li>
          <li>파일당 최대 {setting.maxFileSizeMb}MB</li>
          <li>최대 {setting.maxFileCount}개 첨부</li>
        </ul>

        {/* 드래그 앤 드롭 */}
        <button
          type="button"
          disabled={isSaving}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className="border-lightGray bg-whiteGray hover:border-mainGreen focus-visible:outline-mainGreen flex shrink-0 flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-5 text-gray-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          <UploadCloud size={28} className="text-gray-400" />
          <span className="text-sm leading-6">파일 선택 또는 끌어 놓기</span>
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          disabled={isSaving}
          accept={allowedFormats.join(',')}
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {/* 파일 목록 */}
        {totalCount > 0 && (
          <div className="divide-lightGray border-lightGray divide-y rounded-lg border">
            {retainedFiles.map((file) => (
              <FileRow
                key={`existing-${file.fileId}`}
                name={file.fileName}
                size={formatFileSize(file.fileSize)}
                disabled={isSaving}
                onRemove={() => {
                  if (!savingRef.current) setDeletedFileIds((prev) => [...prev, file.fileId]);
                }}
              />
            ))}
            {newFiles.map((file, index) => (
              <FileRow
                key={`new-${index}`}
                name={file.name}
                size={formatFileSize(file.size)}
                disabled={isSaving}
                onRemove={() => removeNewFile(index)}
              />
            ))}
          </div>
        )}

        {deletedFileIds.length > 0 && (
          <p className="text-sm leading-6 text-gray-600" role="status">
            기존 파일 {deletedFileIds.length}개가 저장 시 삭제돼요. 취소하면 변경되지 않아요.
          </p>
        )}
      </div>

      {/* 저장 제한 사유와 액션은 본문 스크롤 밖에 함께 둔다. */}
      <div className="border-lightGray flex shrink-0 flex-col gap-3 border-t px-5 py-4 sm:px-6">
        {deletedFileIds.length > 0 && totalCount === 0 && (
          <p className="text-sm leading-6 text-red-700" role="alert">
            제출 파일을 최소 1개 남겨야 저장할 수 있어요. 취소하면 기존 파일이 유지돼요.
          </p>
        )}
        {isReplacementBlocked && (
          <p className="text-sm leading-6 text-red-700" role="alert">
            파일 1개 제한 항목은 교체할 수 없어요. 취소하면 기존 파일이 유지돼요.
          </p>
        )}
        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <AdminActionButton
              variant="outline"
              size="lg"
              className="focus-visible:outline-mainGreen flex-1 text-gray-600 hover:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 sm:flex-none"
              onClick={onClose}
              disabled={isSaving}
            >
              취소
            </AdminActionButton>
          </DialogClose>
          <AdminActionButton
            size="lg"
            className="focus-visible:outline-mainGreen flex-1 bg-green-700 hover:bg-green-800 hover:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 sm:flex-none"
            onClick={handleSave}
            disabled={isSaving || isReplacementBlocked || totalCount === 0}
          >
            {isSaving ? '저장 중...' : '저장'}
          </AdminActionButton>
        </div>
      </div>
    </DialogContent>
  );
};

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => {
  return (
    <div className="flex items-start gap-2 text-sm leading-6">
      <span className="shrink-0 pt-1 text-gray-500">{icon}</span>
      <span className="w-16 shrink-0 text-gray-600 sm:w-20">{label}</span>
      <span className="min-w-0 text-gray-800">{value}</span>
    </div>
  );
};

const FileRow = ({
  name,
  size,
  onRemove,
  disabled,
}: {
  name: string;
  size: string;
  onRemove: () => void;
  disabled: boolean;
}) => {
  return (
    <div className="flex items-center gap-3 py-2 pr-1 pl-3">
      <FileText size={18} className="shrink-0 text-gray-500" />
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6 [overflow-wrap:anywhere] text-gray-800">{name}</p>
        <p className="text-xs leading-5 text-gray-500">{size}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`${name} 삭제`}
        className="focus-visible:outline-mainGreen flex size-11 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
      >
        <X size={16} />
      </button>
    </div>
  );
};
