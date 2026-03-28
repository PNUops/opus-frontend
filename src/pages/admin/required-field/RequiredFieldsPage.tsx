import React from 'react';
import { AdminActionButton, AdminHeader } from '@components/admin';
import { useRequiredFields } from 'hooks/useRequiredFields';
import RequiredFields from './RequiredFields';
import QueryWrapper from 'providers/QueryWrapper';
import { useContestIdOrRedirect } from 'hooks/useId';

const RequiredFieldsPage: React.FC = () => {
  const contestId = useContestIdOrRedirect();
  const { fieldsSetting, isPending, setFieldsSetting, handleToggleField, handleSave } = useRequiredFields(contestId);

  return (
    <div className="flex flex-col gap-8">
      <AdminHeader title="필수 항목 설정" description="프로젝트 생성/수정 폼의 필수 항목을 설정합니다.">
        <AdminActionButton className="" disabled={isPending} onClick={handleSave}>
          {isPending ? '저장 중...' : '저장'}
        </AdminActionButton>
      </AdminHeader>
      <QueryWrapper loadingStyle="h-[794px] my-0 rounded-lg" errorStyle="h-[300px]">
        <RequiredFields
          contestId={contestId}
          fields={fieldsSetting}
          setFieldsSetting={setFieldsSetting}
          onToggle={handleToggleField}
        />
      </QueryWrapper>
    </div>
  );
};

export default RequiredFieldsPage;
