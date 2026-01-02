import { useState } from 'react';
import TeamSelector from './TeamSelector';
import AwardSelector from './AwardSelector';
import { useAwardViewAdmin } from 'hooks/useAwardAdmin';

interface AwardEditFormProps {
  contestId: number;
  onSuccess?: () => void;
}

const AwardEditForm = ({ contestId, onSuccess }: AwardEditFormProps) => {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const viewAdmin = useAwardViewAdmin(contestId);

  if (!viewAdmin) {
    return <>Loading...</>;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <TeamSelector teamList={viewAdmin.teamList} onChange={viewAdmin.onSelectTeam} />
      <AwardSelector awards={viewAdmin.awards} />
    </div>
  );
};

export default AwardEditForm;
