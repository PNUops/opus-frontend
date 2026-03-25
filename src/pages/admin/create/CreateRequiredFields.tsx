import { useNavigate } from 'react-router-dom';
import { AdminActionButton, AdminHeader } from '@components/admin';
import { useRequiredFields } from 'hooks/useRequiredFields';
import QueryWrapper from 'providers/QueryWrapper';
import RequiredFields from '../required-field/RequiredFields';
import { useContestCreate } from './ContestCreateContext';

const CreateRequiredFields = () => {
  const { currentStepName, contestId } = useContestCreate();
  const { fieldsSetting, isPending, setFieldsSetting, handleToggleField, handleSave } = useRequiredFields(contestId);
  const navigate = useNavigate();

  const handleButtonClick = () => {
    handleSave();
    navigate('/admin');
  };

  return (
    <div className="flex flex-col gap-7">
      <AdminHeader
        title={currentStepName}
        description="해당 대회의 프로젝트 생성/수정 폼의 필수 항목을 설정해주세요."
      />
      <QueryWrapper loadingStyle="h-[794px] my-0 rounded-lg" errorStyle="h-[300px]">
        <RequiredFields
          contestId={contestId}
          fields={fieldsSetting}
          setFieldsSetting={setFieldsSetting}
          onToggle={handleToggleField}
        />
      </QueryWrapper>
      <div className="flex justify-center">
        <AdminActionButton disabled={isPending} onClick={handleButtonClick}>
          설정하기
        </AdminActionButton>
      </div>
    </div>
  );
};

export default CreateRequiredFields;
