import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AdminHeader,
  AdminCardRow,
  AdminPopoverMenu,
  AdminPopoverEditButton,
  AdminPopoverDeleteButton,
} from '@components/ui/admin';
import { Dialog, DialogTrigger } from '@components/ui/dialog';
import { getContestTracks } from 'apis/contests';
import { TrackDeleteConfirmModal, TrackModal } from './TrackModal';

const TrackManagePage = () => {
  const contestId = 1; // TODO: 현재 선택된 공모전 ID로 변경 필요
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const { data: tracks } = useQuery({
    queryKey: ['tracks', contestId],
    queryFn: () => getContestTracks(contestId),
    enabled: !!contestId,
  });

  return (
    <div className="flex w-full flex-col">
      <Dialog>
        <DialogTrigger asChild>
          <AdminHeader title="분과 관리" onButtonClick={() => alert('분과 생성')} buttonLabel="+ 새 분과" />
        </DialogTrigger>
        <TrackModal type="create" onSubmit={() => {}} />
      </Dialog>
      <div className="h-[35px]" />
      <div className="flex flex-col gap-2">
        {!tracks || tracks.length === 0 ? (
          <div className="bg-whiteGray text-midGray rounded-md p-4 text-center">아직 등록된 분과가 없어요.</div>
        ) : (
          tracks.map((track, index) => (
            <AdminCardRow key={track.trackId} className="even:bg-slate-50">
              <div className="flex w-full items-center gap-4 py-1">
                <p className="text-midGray w-10 flex-shrink-0 text-center text-sm">{(index ?? 0) + 1}</p>
                <p className="flex-1 font-medium">{track.trackName}</p>
                <AdminPopoverMenu>
                  <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <AdminPopoverEditButton
                      onEdit={() => {
                        setEditOpen(true);
                      }}
                    />
                    <TrackModal type="edit" prevName={track.trackName} onSubmit={() => {}} />
                  </Dialog>
                  <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <AdminPopoverDeleteButton
                      onDelete={() => {
                        setDeleteOpen(true);
                      }}
                    />
                    <TrackDeleteConfirmModal trackName={track.trackName} onSubmit={() => {}} />
                  </Dialog>
                </AdminPopoverMenu>
              </div>
            </AdminCardRow>
          ))
        )}
      </div>
    </div>
  );
};

export default TrackManagePage;
