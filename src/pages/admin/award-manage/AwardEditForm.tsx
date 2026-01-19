import TeamSelector from './TeamSelector';
import AwardSelector from './AwardSelector';
import { useAwardViewAdmin } from 'hooks/useAwardAdmin';

interface AwardEditFormProps {
  contestId: number;
  viewAdmin: ReturnType<typeof useAwardViewAdmin>;
  onSuccess?: () => void;
}

const AwardEditForm = ({ contestId, viewAdmin, onSuccess }: AwardEditFormProps) => {
  if (!viewAdmin) {
    return <>Loading...</>;
  }

  return (
    <div className="flex h-[100px] w-full flex-col gap-4">
      <TeamSelector teamList={viewAdmin.teamList} onChange={viewAdmin.onSelectTeam} />
      {viewAdmin.selectedTeamId !== undefined && <AwardSelector awards={viewAdmin.awards} />}
    </div>
  );
};

export default AwardEditForm;
