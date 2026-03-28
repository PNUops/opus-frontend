import VoteTermSetting from './VoteTermSetting';
import VoteLimitSetting from './VoteLimitSetting';

const VoteManagePage = () => {
  return (
    <div className="flex flex-col gap-17.5">
      <VoteTermSetting />
      <VoteLimitSetting />
    </div>
  );
};

export default VoteManagePage;
