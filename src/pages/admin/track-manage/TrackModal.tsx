import { useState } from 'react';
import Input from '@components/Input';
import { AdminFormError } from '@components/admin/AdminFormError';
import { DialogContent, DialogTitle } from '@components/ui/dialog';
import { AdminActionButton, AdminDeleteConfirmModal } from '@components/admin';

interface TrackModalProps {
  type: 'create' | 'edit';
  prevName?: string;
  onSubmit: (trackName: string) => void;
  onClose: () => void;
  isPending: boolean;
  isError: boolean;
}

export const TrackModal = ({ type, prevName, onSubmit, onClose, isPending, isError }: TrackModalProps) => {
  const [trackName, setTrackName] = useState<string>(prevName ?? '');
  const [nameError, setNameError] = useState('');

  const handleClose = () => {
    setTrackName(prevName ?? '');
    onClose();
  };

  const handleSubmit = () => {
    if (isPending) return;
    if (!trackName.trim()) {
      setNameError('분과 이름을 입력해주세요.');
      return;
    }
    onSubmit(trackName.trim());
  };

  return (
    <DialogContent appearance="admin" className="w-[440px]" closeDisabled={isPending}>
      <DialogTitle>{`분과 ${type === 'create' ? '추가' : '수정'}`}</DialogTitle>
      <Input
        appearance="admin"
        aria-label="분과 이름"
        type="text"
        disabled={isPending}
        value={trackName}
        onChange={(e) => {
          setTrackName(e.target.value);
          setNameError('');
        }}
        aria-invalid={!!nameError}
        placeholder="분과를 입력하세요."
        className="min-h-11"
      />
      <AdminFormError
        message={nameError || (isError ? '저장에 실패했어요. 입력 내용을 확인하고 다시 시도해주세요.' : undefined)}
      />
      <div className="flex flex-wrap justify-end gap-3">
        <AdminActionButton variant={'outline'} size={'lg'} onClick={handleClose} disabled={isPending}>
          {'닫기'}
        </AdminActionButton>
        <AdminActionButton size={'lg'} onClick={handleSubmit} disabled={isPending} aria-busy={isPending}>
          {isPending ? '저장 중…' : `${type === 'create' ? '추가' : '수정'}하기`}
        </AdminActionButton>
      </div>
    </DialogContent>
  );
};

interface TrackDeleteConfirmModalProps {
  trackName: string;
  onSubmit: () => void;
  isPending: boolean;
  isError: boolean;
}

export const TrackDeleteConfirmModal = ({ trackName, onSubmit, isPending, isError }: TrackDeleteConfirmModalProps) => {
  return (
    <AdminDeleteConfirmModal
      title="분과를 삭제하시겠습니까?"
      description={trackName}
      onDelete={onSubmit}
      isPending={isPending}
      isError={isError}
    />
  );
};
