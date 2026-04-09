import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@hooks/useToast';
import {
  AdminHeader,
  AdminCardRow,
  AdminPopoverMenu,
  AdminPopoverEditButton,
  AdminPopoverDeleteButton,
} from '@components/admin';
import { Dialog, DialogTrigger } from '@components/ui/dialog';
import { getContestTracks, createContestTrack, updateContestTrack, deleteContestTrack } from '@apis/track';
import { TrackDeleteConfirmModal, TrackModal } from './TrackModal';
import { useContestIdOrRedirect } from '@hooks/useId';

const TrackManagePage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const contestId = useContestIdOrRedirect();
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [editTarget, setEditTarget] = useState<{ id: number; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const { data: tracks } = useQuery({
    queryKey: ['tracks', contestId],
    queryFn: () => getContestTracks(contestId),
    enabled: !!contestId,
  });

  const { mutate: createTrackMutation } = useMutation({
    mutationFn: (payload: { trackName: string }) => createContestTrack(contestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks', contestId] });
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || '분과 생성에 실패했어요.', 'error');
    },
  });

  const { mutate: updateTrackMutation } = useMutation({
    mutationFn: (params: { trackId: number; trackName: string }) =>
      updateContestTrack(contestId, params.trackId, { trackName: params.trackName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks', contestId] });
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || '분과 수정에 실패했어요.', 'error');
    },
  });

  const { mutate: deleteTrackMutation } = useMutation({
    mutationFn: (trackId: number) => deleteContestTrack(contestId, trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks', contestId] });
    },
    onError: (error: any) => {
      toast(error.response?.data?.message || '분과 삭제에 실패했어요.', 'error');
    },
  });

  const handleCreateTrack = (trackName: string) => {
    createTrackMutation({ trackName });
  };

  const handleEditTrack = (trackId: number, trackName: string) => {
    updateTrackMutation({ trackId, trackName });
  };

  const handleDeleteTrack = (trackId: number) => {
    deleteTrackMutation(trackId);
  };

  return (
    <div className="flex w-full flex-col">
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <AdminHeader title="분과 관리" onButtonClick={() => setCreateOpen(true)} buttonLabel="+ 새 분과" />
        </DialogTrigger>
        <TrackModal type="create" onSubmit={handleCreateTrack} onClose={() => setCreateOpen(false)} />
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
                  <AdminPopoverEditButton
                    onEdit={() => {
                      setEditTarget({ id: track.trackId, name: track.trackName });
                    }}
                  />
                  <AdminPopoverDeleteButton
                    onDelete={() => {
                      setDeleteTarget({ id: track.trackId, name: track.trackName });
                    }}
                  />
                </AdminPopoverMenu>
              </div>
            </AdminCardRow>
          ))
        )}
      </div>
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => {
          if (!open) {
            setEditTarget(null);
          }
        }}
      >
        {editTarget && (
          <TrackModal
            type="edit"
            prevName={editTarget.name}
            onSubmit={(trackName) => {
              handleEditTrack(editTarget.id, trackName);
              setEditTarget(null);
            }}
            onClose={() => setEditTarget(null)}
          />
        )}
      </Dialog>
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        {deleteTarget && (
          <TrackDeleteConfirmModal
            trackName={deleteTarget.name}
            onSubmit={() => {
              handleDeleteTrack(deleteTarget.id);
              setDeleteTarget(null);
            }}
          />
        )}
      </Dialog>
    </div>
  );
};

export default TrackManagePage;
