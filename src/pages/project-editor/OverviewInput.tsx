import React, { useRef } from 'react';

interface OverviewInputProps {
  overview: string | null;
  setOverview: (text: string) => void;
  required?: boolean;
}

const MAX_OVERVIEW = 3000;

const OverviewInput = ({ overview, setOverview, required = true }: OverviewInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleOverviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_OVERVIEW) {
      setOverview(e.target.value);
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleOverviewBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const trimmed = e.target.value.trim();
    setOverview(trimmed);
  };

  return (
    <div className="text-exsm flex flex-col gap-3 sm:flex-row sm:gap-10 sm:text-sm">
      <div className="text-midGray flex w-25 gap-1 sm:py-3">
        {required ? <span className="mr-1 text-red-500">*</span> : null}
        <span className="w-full text-nowrap">프로젝트 설명</span>
      </div>
      <div className="flex flex-1 flex-col">
        <textarea
          ref={textareaRef}
          placeholder={`Overview를 입력해주세요. (최대 ${MAX_OVERVIEW}자)`}
          className="placeholder-lightGray border-lightGray focus:border-mainGreen h-40 max-h-40 min-h-40 w-full resize-none overflow-auto rounded border px-4 py-3 transition-all duration-300 ease-in-out focus:outline-none"
          value={overview ?? ''}
          onChange={handleOverviewChange}
          onBlur={handleOverviewBlur}
        />
        <div className={`text-right text-xs ${overview?.length === MAX_OVERVIEW ? 'text-red-500' : 'text-gray-500'}`}>
          {overview?.length} / {MAX_OVERVIEW}자
        </div>
      </div>
    </div>
  );
};

export default OverviewInput;
