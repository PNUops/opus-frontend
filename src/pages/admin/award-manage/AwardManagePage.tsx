import { useAwardViewAdmin } from 'hooks/useAwardAdmin';
import { useContestIdOrRedirect } from 'hooks/useId';
import useTeamList from 'hooks/useTeamList';
import { AdminCardRow, AdminHeader } from '@components/admin';
import AwardTag from '@components/AwardTag';
import AwardEditForm from './AwardEditForm';
import { TeamListItemResponseDto } from 'types/DTO/teams/teamListDto';
import { twMerge } from 'tailwind-merge';
import Spinner from '@components/Spinner';

const AwardManagePage = () => {
  const contestId = useContestIdOrRedirect();
  const viewAdmin = useAwardViewAdmin(contestId);
  const { data: teamList, isLoading, error } = useTeamList(contestId);

  return (
    <div className="flex w-full flex-col">
      <AdminHeader title="수상 관리" description="팀을 선택한 후 수상을 설정해 주세요." />
      <div className="h-[35px]" />
      {isLoading && <Spinner className="h-8 w-8" />}
      {error && <p className="text-mainRed text-sm">팀 목록을 불러오지 못했습니다. 다시 시도해 주세요.</p>}
      {teamList && teamList.length === 0 ? (
        <div className="bg-whiteGray text-midGray rounded-md p-4 text-center">아직 등록된 팀이 없어요.</div>
      ) : !isLoading && !error ? (
        <AwardEditForm contestId={contestId} viewAdmin={viewAdmin} />
      ) : null}
      <div className="h-[35px]" />
      {!isLoading && !error && teamList && <AwardList filterId={viewAdmin.selectedTeamId} teamList={teamList} />}
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
        <AdminCardRow key={team.teamId} className={twMerge('border-lightGray px-0 py-1.5')}>
          <div className="flex w-full items-center gap-4 rounded-lg border p-3">
            <p className="w-10 flex-shrink-0 text-center text-sm">{index + 1}</p>
            <p className="text-darkGray w-[150px] flex-shrink-0 truncate">{team.teamName}</p>{' '}
            <p className="flex-1 truncate text-gray-600">{team.projectName}</p>
            {team.awards.filter((award) => award.awardName && award.awardColor).length > 0 && (
              <div className="flex items-center gap-3">
                {team.awards
                  .filter((award) => award.awardName && award.awardColor)
                  .map((award, index) => (
                    <AwardTag key={index} awardName={award.awardName ?? ''} awardColor={award.awardColor ?? ''} />
                  ))}
              </div>
            )}
          </div>
        </AdminCardRow>
      ))}
    </div>
  );
};

export default AwardManagePage;
