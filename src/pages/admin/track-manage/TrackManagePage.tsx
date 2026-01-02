import { useQuery } from '@tanstack/react-query';
import {
  AdminCardRow,
  AdminPopoverMenu,
  AdminPopoverEditButton,
  AdminPopoverDeleteButton,
  AdminListLayout,
} from '@components/ui/admin';
import { getTracksAdmin } from 'apis/contests';
import { TracksAdminResponseDto } from 'types/DTO';

const TrackManagePage = () => {
  const contestId = 1; // TODO: 현재 선택된 공모전 ID로 변경 필요

  const { data: tracks } = useQuery({
    queryKey: ['tracks', contestId],
    queryFn: () => getTracksAdmin(contestId),
    enabled: !!contestId,
  });

  return (
    <AdminListLayout<TracksAdminResponseDto>
      title="분과 관리"
      buttonLabel="+ 새 분과"
      onButtonClick={() => alert('분과 생성')}
      items={tracks ?? []}
      renderItem={(track) => (
        <AdminCardRow key={track.trackId} className="even:bg-slate-50">
          <div className="flex w-full items-center gap-4 py-1">
            <p className="text-midGray w-10 flex-shrink-0 text-center text-sm">{track.trackId}</p>
            <p className="flex-1 font-medium">{track.trackName}</p>
            <AdminPopoverMenu>
              <AdminPopoverEditButton onEdit={() => {}} />
              <AdminPopoverDeleteButton onDelete={() => {}} />
            </AdminPopoverMenu>
          </div>
        </AdminCardRow>
      )}
    />
  );
};

export default TrackManagePage;
