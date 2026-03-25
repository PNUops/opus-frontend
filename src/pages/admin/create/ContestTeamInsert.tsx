import { PiMicrosoftExcelLogo } from 'react-icons/pi';
import { FiUpload, FiX } from 'react-icons/fi';
import { useMutation } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import Button from '@components/Button';
import { XLSX_MIME_TYPE } from '@constants/contest';
import { AdminHeader } from '@components/admin';
import { cn } from 'utils/classname';
import { useToast } from 'hooks/useToast';
import { postBulkAddTeams } from 'apis/contest';
import { useContestCreate } from './ContestCreateContext';

const ContestTeamInsert = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { currentStepName, contestId, setCurrentStep } = useContestCreate();
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
  };

  const handleUpload = () => {
    if (!file || !contestId) return;

    const formData = new FormData();
    formData.append('file', file);

    bulkAddTeams.mutate(
      {
        contestId: Number(contestId),
        formData,
      },
      {
        onSuccess: () => {
          toast('팀 설정이 완료되었습니다.', 'success');
          setCurrentStep(3);
        },
        onError: (error: any) => {
          toast(error.response?.data?.message || '팀 설정에 실패했습니다.', 'error');
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-7">
      <AdminHeader title={currentStepName} description="대회 카테고리 및 이름을 설정해주세요." />
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
      <div className="flex justify-center">
        <Button
          className="disabled:border-midGray disabled:bg-whiteGray disabled:text-midGray border-mainGreen text-mainGreen w-fit rounded-3xl border px-6 py-2"
          onClick={handleUpload}
          disabled={!file}
        >
          팀 설정하기
        </Button>
      </div>
    </div>
  );
};

export default ContestTeamInsert;
