import { useRef, useState } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { CalendarDays, Eye, FileCheck, FileText, UploadCloud, X } from 'lucide-react';

import { AdminActionButton } from '@components/admin';
import { DialogClose, DialogContent, DialogTitle } from '@components/ui/dialog';
import { useToast } from '@hooks/useToast';
import { getFileFormatExtensions, VISIBILITY_LABEL } from '@constants/submission';
import type { SubmissionFileResponseDto, SubmissionItemSettingResponseDto } from '@dto/submissionDto';

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
  submissionTypeName: string;
  description: string;
  /** 제출물 설정값 (설정값 확인 API) — 시작/마감일시, 지각 제출, 공개 범위, 파일 제약 */
  setting: SubmissionItemSettingResponseDto;
  /** 기존 제출 파일 (재제출 시) */
  existingFiles: SubmissionFileResponseDto[];
  onClose: () => void;
  /** 저장 (초기 업로드 / 파일 첨부) */
  onSave: (files: File[]) => void;
  /** 기존 파일 삭제 */
  onRemoveExistingFile: (file: SubmissionFileResponseDto) => void;
}

export const SubmissionUploadModal = ({
  submissionTypeName,
  description,
  setting,
  existingFiles,
  onClose,
  onSave,
  onRemoveExistingFile,
}: SubmissionUploadModalProps) => {
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const allowedFormats = getFileFormatExtensions(setting.allowedFileFormats);
  const maxSizeBytes = setting.maxFileSizeMb * 1024 * 1024;
  const totalCount = existingFiles.length + newFiles.length;
  const remaining = Math.max(0, setting.maxFileCount - totalCount);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;

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
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <DialogContent className="w-[520px] max-w-[92vw] items-stretch gap-5">
      <DialogTitle className="text-xl font-bold text-gray-900">제출물 업로드</DialogTitle>

      {/* 제출물 정보 */}
      <div className="flex flex-col gap-1">
        <h4 className="text-darkGray text-base font-bold">{submissionTypeName}</h4>
        <p className="text-midGray text-sm">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
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
      <ul className="border-subGreen text-mainGreen flex list-disc flex-col gap-1 rounded-lg border bg-green-50/60 py-3 pr-4 pl-8 text-sm marker:text-green-500">
        <li>파일 형식: {allowedFormats.join(', ')}</li>
        <li>파일 크기: {setting.maxFileSizeMb}MB</li>
        <li>파일 개수: {setting.maxFileCount}개</li>
      </ul>

      {/* 드래그 앤 드롭 */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        className="border-lightGray text-midGray hover:border-mainGreen flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 transition-colors"
      >
        <UploadCloud size={28} className="text-gray-400" />
        <span className="text-sm">파일을 여기로 드래그하거나 클릭하여 업로드 하세요.</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={allowedFormats.join(',')}
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* 파일 목록 */}
      {totalCount > 0 && (
        <div className="flex max-h-44 flex-col gap-2 overflow-y-auto">
          {existingFiles.map((file) => (
            <FileRow
              key={`existing-${file.fileId}`}
              name={file.fileName}
              size={formatFileSize(file.fileSize)}
              onRemove={() => onRemoveExistingFile(file)}
            />
          ))}
          {newFiles.map((file, index) => (
            <FileRow
              key={`new-${index}`}
              name={file.name}
              size={formatFileSize(file.size)}
              onRemove={() => removeNewFile(index)}
            />
          ))}
        </div>
      )}

      {/* 푸터 */}
      <div className="flex justify-end gap-3">
        <DialogClose asChild>
          <AdminActionButton variant="outline" onClick={onClose}>
            취소
          </AdminActionButton>
        </DialogClose>
        <AdminActionButton className="bg-mainGreen hover:bg-green-700" onClick={() => onSave(newFiles)}>
          저장
        </AdminActionButton>
      </div>
    </DialogContent>
  );
};

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-midGray shrink-0">{icon}</span>
      <span className="text-midGray w-16 shrink-0">{label}</span>
      <span className="text-darkGray">{value}</span>
    </div>
  );
};

const FileRow = ({ name, size, onRemove }: { name: string; size: string; onRemove: () => void }) => {
  return (
    <div className="border-lightGray flex items-center gap-3 rounded-lg border px-3 py-2.5">
      <FileText size={18} className="text-midGray shrink-0" />
      <span className="text-darkGray flex-1 truncate text-sm">{name}</span>
      <span className="text-midGray shrink-0 text-xs">{size}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label="파일 삭제"
        className="text-midGray hover:text-darkGray shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
};
