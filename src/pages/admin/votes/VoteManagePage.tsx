import VoteTermSetting from './VoteTermSetting';
import MaxVoteLimitSetting from './MaxVoteLimitSetting';

const VoteManagePage = () => {
  return (
    <div className="flex flex-col gap-[70px]">
      <VoteTermSetting />
      <MaxVoteLimitSetting />
    </div>
  );
};

export default VoteManagePage;
