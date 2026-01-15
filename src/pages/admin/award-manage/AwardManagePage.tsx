import { useQuery } from '@tanstack/react-query';
import { useAwardViewAdmin } from 'hooks/useAwardAdmin';

import useTeamList from 'hooks/useTeamList';
import { AdminCardRow, AdminHeader } from '@components/ui/admin';
import AwardTag from '@components/AwardTag';
import AwardEditForm from './AwardEditForm';
import { TeamListItemResponseDto } from 'types/DTO/teams/teamListDto';

import { twMerge } from 'tailwind-merge';

const AwardManagePage = () => {
  const contestId = 1; // TODO: 현재 선택된 공모전 ID로 변경 필요
  const viewAdmin = useAwardViewAdmin(contestId);
  const { data: teamList, isLoading, error } = useTeamList(contestId);

  return (
    <div className="flex w-full flex-col">
      <AdminHeader title="수상 관리" description="팀 | 프로젝트 | 수상 내역" />
      <div className="h-[35px]" />
      <AwardEditForm contestId={contestId} />
      <AwardList filterId={viewAdmin.selectedTeamId} teamList={teamList ?? []} />
    </div>
  );
};

interface AwardListProps {
  filterId?: number;
  teamList: TeamListItemResponseDto[];
}

const AwardList = ({ filterId = 0, teamList }: AwardListProps) => {
  const filteredTeamList = filterId === 0 ? teamList : teamList.filter((team) => team.teamId === filterId);

  return (
    <div className="flex w-full flex-col">
      {filteredTeamList.map((team, index) => (
        <AdminCardRow key={team.teamId} className={twMerge('border-lightGray', 'even:bg-slate-50')}>
          <p className="text-midGray w-10 flex-shrink-0 text-center text-sm">{index}</p>
          <p className="text-darkGray w-[150px] flex-shrink-0 truncate font-medium">{team.teamName}</p>{' '}
          <p className="flex-1 truncate text-gray-600">{team.projectName}</p>
          {team.awards.filter((award) => award.awardName && award.awardColor).length > 0 && (
            <div className="flex items-center gap-3">
              {team.awards.map((award, index) => (
                <AwardTag
                  key={index}
                  awardName={award.awardName ?? ''}
                  awardColor={award.awardColor ?? ''}
                  removable={true}
                />
              ))}
            </div>
          )}
        </AdminCardRow>
      ))}
    </div>
  );
};

export default AwardManagePage;
