import { useContestIdOrRedirect } from 'hooks/useId';
import ContestTeamSetting from './ContestTeamSetting';

const TeamSettingPage = () => {
  const contestId = useContestIdOrRedirect();

  return <ContestTeamSetting contestId={contestId} />;
};

export default TeamSettingPage;
