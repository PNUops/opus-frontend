import React from 'react';
import RequiredFields from '@pages/admin/required-field/RequiredFields';
import { Button } from '@components/ui/button';
import { useRequiredFields } from 'hooks/useRequiredFields';
import { useParams } from 'react-router-dom';

const RequiredFieldsPage: React.FC = () => {
  const { contestId } = useParams();
  const { fieldsSetting, isLoading, toggleField, handleSave } = useRequiredFields(Number(contestId ?? 0));

  return (
    <div className="flex flex-col gap-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-title mb-2 font-bold">필수 항목 설정</h2>
          <p className="text-sm text-gray-500">프로젝트 생성/수정 폼의 필수 항목을 설정합니다.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-mainBlue hover:bg-blue-600" onClick={handleSave} disabled={isLoading}>
            {isLoading ? '저장 중...' : '저장'}
          </Button>
        </div>
      </header>
      <RequiredFields fields={fieldsSetting} onToggle={toggleField} />
    </div>
  );
};

export default RequiredFieldsPage;
