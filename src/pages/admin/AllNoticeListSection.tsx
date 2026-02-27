import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  AdminCard,
  AdminCardTop,
  AdminCardCreateButton,
  AdminCardRow,
  AdminPopoverMenu,
  AdminPopoverEditButton,
  AdminPopoverDeleteButton,
  AdminNoData,
} from '@components/ui/admin';
import { Dialog, DialogTrigger } from '@components/ui/dialog';
import { noticeOption } from 'queries/notices';
import QueryWrapper from 'providers/QueryWrapper';
import { NoticeDeleteConfirmModal, NoticeModal } from './NoticeModal';

const AllNoticeListSection = () => {
  const [createOpen, setCreateOpen] = useState<boolean>(false);

  return (
    <AdminCard>
      <AdminCardTop>
        <h2 className="text-2xl font-bold">전체 공지사항 목록</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <AdminCardCreateButton>+ 새 공지</AdminCardCreateButton>
          </DialogTrigger>
          <NoticeModal type="create" closeModal={() => setCreateOpen(false)} />
        </Dialog>
      </AdminCardTop>
      <div className="max-h-[300px] overflow-y-auto px-2.5">
        <QueryWrapper loadingStyle="h-50 rounded-lg" errorStyle="h-50">
          <AllNoticeList />
        </QueryWrapper>
      </div>
    </AdminCard>
  );
};

export default AllNoticeListSection;

const AllNoticeList = () => {
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const { data: notices } = useSuspenseQuery(noticeOption());

  if (notices.length === 0) return <AdminNoData />;

  return notices.map((notice) => (
    <AdminCardRow key={notice.noticeId} className="border-b-lightGray px-2.5 not-last:border-b">
      <div className="flex gap-10">
        <div>{dayjs(notice.createdAt).format('YYYY년 MM월 DD일 HH:mm')}</div>
        <div>{notice.title}</div>
      </div>
      <AdminPopoverMenu>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <AdminPopoverEditButton onEdit={() => setEditOpen(true)} />
          <NoticeModal type="edit" noticeId={notice.noticeId} isOpen={editOpen} closeModal={() => setEditOpen(false)} />
        </Dialog>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <AdminPopoverDeleteButton onDelete={() => setDeleteOpen(true)} />
          <NoticeDeleteConfirmModal noticeId={notice.noticeId} closeModal={() => setDeleteOpen(false)} />
        </Dialog>
      </AdminPopoverMenu>
    </AdminCardRow>
  ));
};
