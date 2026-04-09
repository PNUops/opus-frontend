import { ContestCreateProvider, useContestCreate } from './ContestCreateContext';
import ContestCreateProgress from './ContestCreateProgress';
import ContestCreateForm from './ContestCreateForm';
import CreateRequiredFields from './CreateRequiredFields';
import ContestTeamSetting from '../team-setting/ContestTeamSetting';

const ContestCreateContent = () => {
  const { contestId, currentStep, setCurrentStep } = useContestCreate();

  return (
    <div className="flex flex-col gap-8">
      <ContestCreateProgress />
      <div className="border-t pt-8">
        {currentStep === 1 && <ContestCreateForm />}
        {currentStep === 2 && <ContestTeamSetting contestId={contestId} handleSkip={() => setCurrentStep(3)} />}
        {currentStep === 3 && <CreateRequiredFields />}
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
