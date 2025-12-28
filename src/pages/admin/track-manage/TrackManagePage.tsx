import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContestId } from 'hooks/useId';
import {
  AdminHeader,
  AdminCardRow,
  AdminPopoverMenu,
  AdminPopoverEditButton,
  AdminPopoverDeleteButton,
} from '@components/ui/admin';
import { twMerge } from 'tailwind-merge';
import { getTracksAdmin } from 'apis/contests';
import { TracksAdminResponseDto } from 'types/DTO';

const TrackManageHeader = () => {
  const navigate = useNavigate();
  const contestId = useContestId();
  const handleCreateTrack = () => alert('분과 생성 훅 호출');
  return <AdminHeader title="분과 관리" onButtonClick={handleCreateTrack} buttonLabel="+ 새 분과" />;
};

type TrackManageListProps = { tracks: TracksAdminResponseDto[] };
const TrackManageList = ({ tracks }: TrackManageListProps) => {
  const navigate = useNavigate();
  const handleDeleteTeam = (teamId: number) => {
    alert(`팀 ${teamId} 삭제 훅 호출`);
  };
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  return (
    <div className="flex flex-col">
      {tracks.map((track) => (
        <AdminCardRow key={track.trackId} className={twMerge('border-lightGray', 'even:bg-slate-50')}>
          <div className="flex w-full items-center gap-4 py-1">
            <p className="text-midGray w-10 flex-shrink-0 text-center text-sm">{track.trackId}</p>
            <div className="flex min-w-0 flex-1 items-center gap-6">
              <p className="text-darkGray w-[150px] flex-shrink-0 truncate font-medium">{track.trackName}</p>
            </div>
          </div>
          <div className="flex w-10 flex-shrink-0 justify-end">
            <AdminPopoverMenu>
              <AdminPopoverEditButton onEdit={() => alert('분과 수정 훅 호출')} />
              <AdminPopoverDeleteButton
                onDelete={() => {
                  handleDeleteTeam(track.trackId);
                  setDeleteOpen(true);
                }}
              />
            </AdminPopoverMenu>
          </div>
        </AdminCardRow>
      ))}
    </div>
  );
};

const TrackManagePage = () => {
  const contestId = 1; // TODO: 현재 선택된 공모전 ID로 변경 필요

  const { data: tracksAdmin } = useQuery({
    queryKey: ['tracks', contestId],
    queryFn: () => getTracksAdmin(contestId),
    enabled: !!contestId,
  });

  return (
    <div className="flex w-full flex-col">
      <TrackManageHeader />
      <div className="h-[35px]" />
      <TrackManageList tracks={tracksAdmin ?? []} />
    </div>
  );
};

export default TrackManagePage;
