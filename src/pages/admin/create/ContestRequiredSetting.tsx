import { useRequiredFields } from 'hooks/useRequiredFields';
import Button from '@components/Button';
import { useContestCreate } from './ContestCreateContext';
import RequiredFields from '../required-field/RequiredFields';

const ContestRequiredSetting = () => {
  const { contestId } = useContestCreate();
  const { fieldsSetting, isLoading, toggleField, handleSave } = useRequiredFields(contestId ?? 0);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold">필수 항목 설정</h2>
        <div className="text-midGray text-xs">해당 대회의 프로젝트 생성/수정 폼의 필수 항목을 설정해주세요.</div>
      </div>
      <RequiredFields fields={fieldsSetting} onToggle={toggleField} />
      <div className="flex justify-center">
        <Button
          className="disabled:border-midGray disabled:bg-whiteGray disabled:text-midGray border-mainGreen text-mainGreen w-fit rounded-3xl border px-6 py-2"
          disabled={isLoading}
          onClick={handleSave}
        >
          설정하기
        </Button>
      </div>
    </div>
  );
};

export default ContestRequiredSetting;
