import { AdminQueryState } from '@components/admin/AdminQueryState';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@hooks/useToast';
import {
  AdminHeader,
  AdminCardCreateButton,
  AdminCardRow,
  AdminPopoverMenu,
  AdminPopoverEditButton,
  AdminPopoverDeleteButton,
} from '@components/admin';
import { Dialog, DialogTrigger } from '@components/ui/dialog';
import { getContestTracks, createContestTrack, updateContestTrack, deleteContestTrack } from '@apis/track';
import { TrackDeleteConfirmModal, TrackModal } from './TrackModal';
import { useContestIdOrRedirect } from '@hooks/useId';
import { getApiErrorMessage } from '@utils/error';

const TrackManagePage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const contestId = useContestIdOrRedirect();
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [editTarget, setEditTarget] = useState<{ id: number; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const listQuery = useQuery({
    queryKey: ['tracks', contestId],
    queryFn: () => getContestTracks(contestId),
    enabled: !!contestId,
  });

  const {
    mutate: createTrackMutation,
    isPending: isCreating,
    isError: createFailed,
    reset: resetCreate,
  } = useMutation({
    mutationFn: (payload: { trackName: string }) => createContestTrack(contestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks', contestId] });
    },
    onError: (error) => {
      toast(getApiErrorMessage(error, '분과 생성에 실패했어요.'), 'error');
    },
  });

  const {
    mutate: updateTrackMutation,
    isPending: isUpdating,
    isError: updateFailed,
    reset: resetUpdate,
  } = useMutation({
    mutationFn: (params: { trackId: number; trackName: string }) =>
      updateContestTrack(contestId, params.trackId, { trackName: params.trackName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks', contestId] });
    },
    onError: (error) => {
      toast(getApiErrorMessage(error, '분과 수정에 실패했어요.'), 'error');
    },
  });

  const {
    mutate: deleteTrackMutation,
    isPending: isDeleting,
    isError: deleteFailed,
    reset: resetDelete,
  } = useMutation({
    mutationFn: (trackId: number) => deleteContestTrack(contestId, trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracks', contestId] });
    },
    onError: (error) => {
      toast(getApiErrorMessage(error, '분과 삭제에 실패했어요.'), 'error');
    },
  });

  const handleCreateTrack = (trackName: string) => {
    if (isCreating) return;
    createTrackMutation({ trackName }, { onSuccess: () => setCreateOpen(false) });
  };

  const handleEditTrack = (trackId: number, trackName: string) => {
    if (isUpdating) return;
    updateTrackMutation({ trackId, trackName }, { onSuccess: () => setEditTarget(null) });
  };

  const handleDeleteTrack = (trackId: number) => {
    if (isDeleting) return;
    deleteTrackMutation(trackId, { onSuccess: () => setDeleteTarget(null) });
  };

  const { data: tracks } = listQuery;

  return (
    <div className="flex w-full flex-col">
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          if (open) resetCreate();
          setCreateOpen(open);
        }}
      >
        <AdminHeader title="분과 관리">
          <DialogTrigger asChild>
            <AdminCardCreateButton>+ 새 분과</AdminCardCreateButton>
          </DialogTrigger>
        </AdminHeader>
        <TrackModal
          isPending={isCreating}
          isError={createFailed}
          type="create"
          onSubmit={handleCreateTrack}
          onClose={() => setCreateOpen(false)}
        />
      </Dialog>
      <div className="h-[35px]" />
      <AdminQueryState query={listQuery}>
        <div className="flex flex-col gap-2">
          {!tracks || tracks.length === 0 ? (
            <div className="bg-whiteGray rounded-md p-4 text-center text-neutral-600">아직 등록된 분과가 없어요.</div>
          ) : (
            tracks.map((track, index) => (
              <AdminCardRow key={track.trackId} className="even:bg-slate-50">
                <div className="flex w-full items-center gap-4 py-1">
                  <p className="w-10 flex-shrink-0 text-center text-sm text-neutral-600">{(index ?? 0) + 1}</p>
                  <p className="flex-1 font-medium">{track.trackName}</p>
                  <AdminPopoverMenu>
                    <AdminPopoverEditButton
                      onEdit={() => {
                        resetUpdate();
                        setEditTarget({ id: track.trackId, name: track.trackName });
                      }}
                    />
                    <AdminPopoverDeleteButton
                      onDelete={() => {
                        resetDelete();
                        setDeleteTarget({ id: track.trackId, name: track.trackName });
                      }}
                    />
                  </AdminPopoverMenu>
                </div>
              </AdminCardRow>
            ))
          )}
        </div>
      </AdminQueryState>
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
            isPending={isUpdating}
            isError={updateFailed}
            prevName={editTarget.name}
            onSubmit={(trackName) => {
              handleEditTrack(editTarget.id, trackName);
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
            isPending={isDeleting}
            isError={deleteFailed}
            trackName={deleteTarget.name}
            onSubmit={() => {
              handleDeleteTrack(deleteTarget.id);
            }}
          />
        )}
      </Dialog>
    </div>
  );
};

export default TrackManagePage;
