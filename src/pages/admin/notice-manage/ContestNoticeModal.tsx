import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DialogContent, DialogTitle } from '@components/ui/dialog';
import Input from '@components/Input';
import TextArea from '@components/TextArea';
import { createContestNotice, deleteContestNotice, updateContestNotice } from 'apis/notice';
import { useToast } from 'hooks/useToast';
import { NoticeRequestDto } from 'types/DTO/noticeDto';
import { AdminActionButton, AdminDeleteConfirmModal } from '@components/admin';
import { contestNoticeDetailOption } from 'queries/notices';

interface ContestNoticeModalProps {
  type: 'create' | 'edit';
  contestId: number;
  noticeId?: number;
  isOpen?: boolean;
  closeModal: () => void;
}

export const ContestNoticeModal = ({ type, contestId, noticeId, isOpen, closeModal }: ContestNoticeModalProps) => {
  const toast = useToast();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: notice } = useQuery(contestNoticeDetailOption(contestId, noticeId ?? 0));

  const upsertMutation = useMutation({
    mutationFn: (payload: NoticeRequestDto) => {
      if (type === 'edit' && noticeId) {
        return updateContestNotice(contestId, noticeId, payload);
      }
      return createContestNotice(contestId, payload);
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

  const handleSave = async () => {
    await upsertMutation.mutateAsync(
      { title, description },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          queryClient.invalidateQueries({ queryKey: ['contestNotices', contestId] });
          if (type === 'edit' && noticeId) {
            queryClient.invalidateQueries({ queryKey: ['contestNoticeDetail', contestId, noticeId] });
          }
          toast(`공지사항이 ${type === 'create' ? '작성' : '수정'} 되었어요.`, 'success');
        },
        onError: () => {
          toast(`공지사항 ${type === 'create' ? '작성' : '수정'}에 실패했어요.`, 'error');
        },
      },
    );
    closeModal();
  };

  return (
    <DialogContent className="w-[500px]">
      <DialogTitle className="text-2xl font-bold">{`공지사항 ${type === 'create' ? '추가' : '수정'}`}</DialogTitle>
      <div className="grid grid-cols-[max-content_1fr] gap-x-8 gap-y-4">
        <label htmlFor="title" className="m-2">
          제목
        </label>
        <Input id="title" placeholder="제목을 입력해주세요" value={title} onChange={(e) => setTitle(e.target.value)} />
        <label htmlFor="description" className="m-2">
          본문
        </label>
        <TextArea
          id="description"
          placeholder="본문을 입력해주세요"
          className="min-h-48"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-4">
        <AdminActionButton variant={'outline'} size={'lg'} className="rounded-full" onClick={handleClose}>
          취소
        </AdminActionButton>
        <AdminActionButton size={'lg'} className="rounded-full" onClick={handleSave}>
          {type === 'create' ? '추가' : '저장'}
        </AdminActionButton>
      </div>
    </DialogContent>
  );
};

interface ContestNoticeDeleteConfirmModalProps {
  contestId: number;
  noticeId: number;
  closeModal: () => void;
}

export const ContestNoticeDeleteConfirmModal = ({
  contestId,
  noticeId,
  closeModal,
}: ContestNoticeDeleteConfirmModalProps) => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const noticeDelete = useMutation({
    mutationKey: ['contestNoticeDelete'],
    mutationFn: (noticeId: number) => deleteContestNotice(contestId, noticeId),
  });

  const onDelete = async () => {
    await noticeDelete.mutateAsync(noticeId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['contestNotices', contestId] });
        toast('공지사항이 삭제되었어요.', 'success');
      },
      onError: () => {
        toast('공지사항 삭제에 실패했어요.', 'error');
      },
    });
    closeModal();
  };

  return <AdminDeleteConfirmModal title={'공지사항을 삭제하시겠습니까?'} onDelete={onDelete} />;
};
