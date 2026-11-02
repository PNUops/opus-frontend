import type { AssignedTeam } from '../types/roleAssignment';

interface RoleTeamChipProps {
  team: AssignedTeam;
}

export const RoleTeamChip = ({ team }: RoleTeamChipProps) => {
  return (
    <span className="bg-mainBlue/15 text-mainBlue inline-flex max-w-full min-w-0 items-center rounded-md px-2 py-1 text-sm font-medium break-words whitespace-normal">
      {team.teamName}
    </span>
  );
};
