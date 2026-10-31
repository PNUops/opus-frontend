import { AdminFormError } from '@components/admin/AdminFormError';
import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DialogContent, DialogTitle } from '@components/ui/dialog';
import Input from '@components/Input';
import TextArea from '@components/TextArea';
import { deleteNotice, patchNotice, postCreateNotice } from '@apis/notice';
import { useToast } from '@hooks/useToast';
import { noticeDetailOption } from '@queries/notices';
import { NoticeRequestDto } from '@dto/noticeDto';
import { AdminActionButton, AdminDeleteConfirmModal } from '@components/admin';

interface NoticeModalProps {
  type: 'create' | 'edit';
  noticeId?: number;
  isOpen?: boolean;
  closeModal: () => void;
}

export const NoticeModal = ({ type, noticeId, isOpen, closeModal }: NoticeModalProps) => {
  const toast = useToast();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: notice } = useQuery(noticeDetailOption(noticeId ?? 0));
  const upsertMutation = useMutation({
    mutationFn: (payload: NoticeRequestDto) => {
      if (type === 'edit' && noticeId) {
        return patchNotice(noticeId, payload);
      } else {
        return postCreateNotice(payload);
      }
    },
  });

  useEffect(() => {
    if (type === 'edit' && isOpen && notice) {
      setTitle(notice.title || '');
      setDescription(notice.description || '');
    }
  }, [type, isOpen, notice]);

  const handleClose = () => {
    setTitle(notice?.title || '');
    setDescription(notice?.description || '');
    closeModal();
  };

  const handleSave = () => {
    if (upsertMutation.isPending) return;
    upsertMutation.mutate(
      { title, description },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          queryClient.invalidateQueries({ queryKey: ['notices'] });
          if (type === 'edit' && noticeId) {
            queryClient.invalidateQueries({ queryKey: ['noticeDetail', noticeId] });
          }
          toast(`공지사항이 ${type === 'create' ? '작성' : '수정'} 되었어요.`, 'success');
          closeModal();
        },
        onError: () => {
          toast(`공지사항 ${type === 'create' ? '작성' : '수정'}에 실패했어요.`, 'error');
        },
      },
    );
  };

  return (
    <DialogContent appearance="admin" className="w-[560px]" closeDisabled={upsertMutation.isPending}>
      <DialogTitle className="text-2xl font-bold">{`공지사항 ${type === 'create' ? '추가' : '수정'}`}</DialogTitle>
      <div className="grid grid-cols-1 gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          제목
        </label>
        <Input
          appearance="admin"
          disabled={upsertMutation.isPending}
          id="title"
          placeholder="제목을 입력해주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label htmlFor="description" className="text-sm font-medium">
          본문
        </label>
        <TextArea
          appearance="admin"
          disabled={upsertMutation.isPending}
          id="description"
          placeholder="본문을 입력해주세요"
          className="min-h-48"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <AdminFormError
        message={upsertMutation.isError ? '저장에 실패했어요. 입력 내용을 확인하고 다시 시도해주세요.' : undefined}
      />
      <div className="flex flex-wrap justify-end gap-3">
        <AdminActionButton variant={'outline'} size={'lg'} onClick={handleClose} disabled={upsertMutation.isPending}>
          닫기
        </AdminActionButton>
        <AdminActionButton
          size={'lg'}
          onClick={handleSave}
          disabled={upsertMutation.isPending}
          aria-busy={upsertMutation.isPending}
        >
          {upsertMutation.isPending ? '저장 중…' : `${type === 'create' ? '추가' : '저장'}하기`}
        </AdminActionButton>
      </div>
    </DialogContent>
  );
};

interface NoticeDeleteConfirmModalProps {
  noticeId: number;
  closeModal: () => void;
}

export const NoticeDeleteConfirmModal = ({ noticeId, closeModal }: NoticeDeleteConfirmModalProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const noticeDelete = useMutation({
    mutationKey: ['noticeDelete'],
    mutationFn: (noticeId: number) => deleteNotice(noticeId),
  });

  const onDelete = () => {
    if (noticeDelete.isPending) return;
    noticeDelete.mutate(noticeId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notices'] });
        toast('공지사항이 삭제되었어요.', 'success');
        closeModal();
      },
      onError: () => {
        toast('공지사항 삭제에 실패했어요.', 'error');
      },
    });
  };

  return (
    <AdminDeleteConfirmModal
      title={'공지사항을 삭제하시겠습니까?'}
      onDelete={onDelete}
      isPending={noticeDelete.isPending}
      isError={noticeDelete.isError}
    />
  );
};
