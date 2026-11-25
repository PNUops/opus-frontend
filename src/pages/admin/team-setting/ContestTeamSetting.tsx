import { PiMicrosoftExcelLogo } from 'react-icons/pi';
import { FiUpload, FiX } from 'react-icons/fi';
import { useMutation } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { XLSX_MIME_TYPE } from '@constants/contest';
import { AdminActionButton, AdminHeader } from '@components/admin';
import { Dialog } from '@components/ui/dialog';
import { cn } from '@utils/classname';
import { postBulkAddTeams } from '@apis/contest';
import { useToast } from '@hooks/useToast';
import { ContestBulkAddTeamsErrorDto } from '@dto/contestsDto';
import { TemplateErrorModal } from '../create/TemplateErrorModal';

interface ContestTeamInsertProps {
  contestId: number;
  handleSkip?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onPendingChange?: (pending: boolean) => void;
  maxFileSizeMb?: number;
}

const ContestTeamSetting = ({
  contestId,
  handleSkip,
  onComplete,
  onCancel,
  onPendingChange,
  maxFileSizeMb,
}: ContestTeamInsertProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [templateErrors, setTemplateErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const bulkAddTeams = useMutation({
    mutationKey: ['bulkAddTeams'],
    mutationFn: (payload: { contestId: number; formData: FormData }) =>
      postBulkAddTeams(payload.contestId, payload.formData),
  });

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile) {
      if (maxFileSizeMb && selectedFile.size > maxFileSizeMb * 1024 * 1024) {
        toast(`파일 크기는 ${maxFileSizeMb}MB 이하여야 합니다.`, 'error');
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
      if (selectedFile.type === XLSX_MIME_TYPE || selectedFile.name.endsWith('.xlsx')) {
        setTemplateErrors([]);
        setFile(selectedFile);
      } else {
        toast('지원되는 파일 형식과 맞지 않습니다.', 'error');
      }
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFileChange(droppedFiles[0]);
    }
  };

  const handleAreaClick = () => {
    inputRef.current?.click();
  };

  const handleRemoveFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSetting = () => {
    if (!file || !contestId || bulkAddTeams.isPending) return;

    const formData = new FormData();
    formData.append('file', file);

    onPendingChange?.(true);
    bulkAddTeams.mutate(
      {
        contestId: Number(contestId),
        formData,
      },
      {
        onSuccess: (data) => {
          toast(`${data.teamCount}개의 팀 생성이 완료되었습니다.`, 'success');
          onComplete?.();
          handleSkip?.();
        },
        onSettled: () => onPendingChange?.(false),
        onError: (error: any) => {
          if (error.response?.data?.message) toast(error.response.data.message, 'error');
          else if (error.response?.data?.errors) {
            const errors = error.response.data.errors;
            setTemplateErrors(errors.map((e: ContestBulkAddTeamsErrorDto) => `${e.rowNumber}행 - ${e.message}`));
            setFile(null);
            if (inputRef.current) inputRef.current.value = '';
          } else toast(`팀·참여자 설정에 실패했습니다.`, 'error');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-7">
      {!onComplete && (
        <AdminHeader title="팀·참여자 설정" description="하단 엑셀 파일 양식에 참여 팀들을 기입 후 업로드 해주세요." />
      )}
      <a href="/PNUOps_관리자페이지_팀등록_템플릿파일.xlsx" className="group flex items-center gap-1">
        <PiMicrosoftExcelLogo size={24} className="fill-mainGreen mt-0.75 shrink-0" />
        <span className="group-hover:text-mainGreen min-w-0 text-lg [overflow-wrap:anywhere] group-hover:underline">
          PNUOps_관리자페이지_팀등록_템플릿파일.xlsx
        </span>
      </a>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
        accept={`.xlsx,${XLSX_MIME_TYPE}`}
      />
      <div
        className={cn(
          'border-lightGray flex min-h-[160px] flex-col items-center justify-center gap-[15px] rounded-lg border border-dashed p-4 transition-colors',
          {
            'border-mainBlue bg-blue-50': isDragging,
          },
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex items-center gap-2 text-gray-700">
            <PiMicrosoftExcelLogo size={24} className="fill-mainGreen" />
            <span className="font-semibold">{file.name}</span>
            <button
              type="button"
              aria-label="선택한 파일 삭제"
              onClick={handleRemoveFile}
              className="rounded-full p-1 hover:bg-gray-200"
            >
              <FiX size={18} />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={handleAreaClick}
              className="focus-visible:outline-mainBlue flex flex-col items-center gap-3 rounded-md px-4 py-2 text-sm text-neutral-600 focus-visible:outline-2"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <FiUpload size={20} className="stroke-mainBlue" />
              </span>
              <span>
                <span className="font-bold">팀 정보 파일</span>을 선택하거나 여기에 놓아주세요.
              </span>
              <span>지원되는 파일 형식: .xlsx{maxFileSizeMb && ` · 최대 ${maxFileSizeMb}MB`}</span>
            </button>
          </>
        )}
      </div>
      <Dialog open={templateErrors.length > 0} onOpenChange={(open) => !open && setTemplateErrors([])}>
        <TemplateErrorModal errors={templateErrors} />
      </Dialog>
      <div className="flex items-center justify-center gap-6">
        {onCancel && (
          <AdminActionButton size="lg" variant="outline" disabled={bulkAddTeams.isPending} onClick={onCancel}>
            취소
          </AdminActionButton>
        )}
        {handleSkip && (
          <AdminActionButton size="lg" variant="outline" onClick={handleSkip}>
            나중에 설정하기
          </AdminActionButton>
        )}
        <AdminActionButton size="lg" disabled={!file || !contestId || bulkAddTeams.isPending} onClick={handleSetting}>
          {onComplete ? '등록하기' : '설정하기'}
        </AdminActionButton>
      </div>
    </div>
  );
};

export default ContestTeamSetting;
