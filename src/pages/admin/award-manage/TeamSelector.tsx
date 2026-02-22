import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { TeamListItemResponseDto } from 'types/DTO/teams/teamListDto';

interface TeamSelectorProps {
  teamList: TeamListItemResponseDto[];
  onChange: (teamId: number) => void;
}

const TeamSelector = ({ teamList, onChange }: TeamSelectorProps) => {
  const [selectedValue, setSelectedValue] = useState<string>('');

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    const teamId = parseInt(value, 10);
    onChange(teamId);
  };

  return (
    <div className="flex w-full items-center gap-4">
      <label className="w-30 flex-shrink-0 text-sm leading-none">수상 팀</label>
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger className="focus:outline:none focus:border-mainGreen w-full overflow-hidden border text-sm focus:ring-0">
          <SelectValue placeholder="수상팀을 선택해주세요." className="truncate" />
        </SelectTrigger>
        <SelectContent className="max-h-72 text-sm">
          <SelectItem key={0} value={'0'} className="overflow-hidden">
            <span className="block w-full truncate">전체 보기</span>
          </SelectItem>
          {teamList.map((team) => {
            const selectText = `${team.teamId}. ${team.teamName} - ${team.projectName}`;
            return (
              <SelectItem key={team.teamId} value={team.teamId.toString()} className="overflow-hidden">
                <span className="block w-full truncate">{selectText}</span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};

export default TeamSelector;
