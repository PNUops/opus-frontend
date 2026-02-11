import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DialogClose, DialogContent, DialogTitle } from '@components/ui/dialog';
import Input from '@components/Input';
import RoundedButton from '@components/RoundedButton';
import TextArea from '@components/TextArea';
import { deleteNotice, patchNotice, postCreateNotice } from 'apis/notices';
import { useToast } from 'hooks/useToast';
import { noticeDetailOption } from 'queries/notices';
import { NoticeRequestDto } from 'types/DTO/noticeDto';
import { AdminDeleteConfirmModal } from '@components/ui/admin';

interface NoticeModalProps {
  type: 'create' | 'edit';
  noticeId?: number;
  closeModal: () => void;
}

export const NoticeModal = ({ type, noticeId, closeModal }: NoticeModalProps) => {
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
    if (notice) {
      setTitle(notice.title || '');
      setDescription(notice.description || '');
    }
  }, [notice]);

  const handleSave = async () => {
    await upsertMutation.mutateAsync(
      { title, description },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          queryClient.invalidateQueries({ queryKey: ['notices'] });
          toast(`공지사항이 작성 되었습니다.`, 'success');
        },
        onError: () => {
          toast(`공지사항 작성에 실패했습니다.`, 'error');
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
        <DialogClose asChild>
          <RoundedButton className="min-w-28">취소</RoundedButton>
        </DialogClose>
        <RoundedButton className="min-w-28" onClick={handleSave}>
          {type === 'create' ? '추가' : '저장'}
        </RoundedButton>
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

  const onDelete = async () => {
    await noticeDelete.mutateAsync(noticeId, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['notices'] });
        toast('공지사항이 삭제되었습니다.', 'success');
      },
      onError: () => {
        toast('공지사항 삭제에 실패했습니다.', 'error');
      },
    });
    closeModal();
  };

  return <AdminDeleteConfirmModal title={'공지사항을 삭제하시겠습니까?'} onDelete={onDelete} />;
};
