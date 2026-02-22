import { ContestCreateProvider, useContestCreate } from './ContestCreateContext';
import ContestCreateProgress from './ContestCreateProgress';
import ContestCreateForm from './ContestCreateForm';
import ContestTeamInsert from './ContestTeamInsert';
import ContestRequiredSetting from './ContestRequiredSetting';

const ContestCreateContent = () => {
  const { currentStep } = useContestCreate();

  return (
    <div className="flex flex-col gap-8">
      <ContestCreateProgress />
      <div className="border-t pt-8">
        {currentStep === 1 && <ContestCreateForm />}
        {currentStep === 2 && <ContestTeamInsert />}
        {currentStep === 3 && <ContestRequiredSetting />}
      </div>
    </div>
  );
};

const ContestCreatePage = () => {
  return (
    <ContestCreateProvider>
      <ContestCreateContent />
    </ContestCreateProvider>
  );
};

export default ContestCreatePage;
