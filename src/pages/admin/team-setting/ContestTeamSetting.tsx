import { PiMicrosoftExcelLogo } from 'react-icons/pi';
import { FiUpload, FiX } from 'react-icons/fi';
import { useMutation } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { XLSX_MIME_TYPE } from '@constants/contest';
import { AdminActionButton, AdminHeader } from '@components/admin';
import { Dialog } from '@components/ui/dialog';
import { cn } from 'utils/classname';
import { postBulkAddTeams } from 'apis/contest';
import { useToast } from 'hooks/useToast';
import { ContestBulkAddTeamsErrorDto } from 'types/DTO';
import { TemplateErrorModal } from '../create/TemplateErrorModal';

interface ContestTeamInsertProps {
  contestId: number;
  handleSkip?: () => void;
}

const ContestTeamSetting = ({ contestId, handleSkip }: ContestTeamInsertProps) => {
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
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    bulkAddTeams.mutate(
      {
        contestId: Number(contestId),
        formData,
      },
      {
        onSuccess: (data) => {
          toast(`${data.teamCount}개의 팀 생성이 완료되었습니다.`, 'success');
          handleSkip?.();
        },
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
      <AdminHeader title="팀·참여자 설정" description="하단 엑셀 파일 양식에 참여 팀들을 기입 후 업로드 해주세요." />
      <a href="/팀등록_템플릿파일.xlsx" className="group flex items-center gap-1">
        <PiMicrosoftExcelLogo size={24} className="fill-mainGreen mt-0.75" />
        <span className="group-hover:text-mainGreen text-lg group-hover:underline">팀등록_템플릿파일.xlsx</span>
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
          'border-lightGray flex h-[160px] cursor-pointer flex-col items-center justify-center gap-[15px] rounded-lg border border-dashed transition-colors',
          {
            'border-mainBlue bg-blue-50': isDragging,
          },
        )}
        onClick={handleAreaClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex items-center gap-2 text-gray-700">
            <PiMicrosoftExcelLogo size={24} className="fill-mainGreen" />
            <span className="font-semibold">{file.name}</span>
            <button onClick={handleRemoveFile} className="rounded-full p-1 hover:bg-gray-200">
              <FiX size={18} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <FiUpload size={20} className="stroke-mainBlue" />
            </div>
            <div className="text-midGray flex flex-col items-center gap-2 text-[14px]">
              <p>
                <span className="font-bold">팀 정보 파일</span>을 업로드 해주세요.
              </p>
              <p>지원되는 파일 형식: .xlsx</p>
            </div>
          </>
        )}
      </div>
      <Dialog open={templateErrors.length > 0} onOpenChange={(open) => !open && setTemplateErrors([])}>
        <TemplateErrorModal errors={templateErrors} />
      </Dialog>
      <div className="flex items-center justify-center gap-6">
        {handleSkip && (
          <AdminActionButton size="lg" className="rounded-full" variant="outline" onClick={handleSkip}>
            나중에 설정하기
          </AdminActionButton>
        )}
        <AdminActionButton
          size="lg"
          className="rounded-full"
          disabled={!file || bulkAddTeams.isPending}
          onClick={handleSetting}
        >
          설정하기
        </AdminActionButton>
      </div>
    </div>
  );
};

export default ContestTeamSetting;
