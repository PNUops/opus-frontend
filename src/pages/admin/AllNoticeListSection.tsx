import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { NoticeDeleteConfirmModal, NoticeModal } from './NoticeModal';

const AllNoticeListSection = () => {
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const { data: notices } = useQuery(noticeOption());

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
      <div className="max-h-[300px] overflow-y-auto">
        {notices?.map((notice) => (
          <AdminCardRow key={notice.noticeId} className="border-b-lightGray not-last:border-b">
            <div className="flex gap-10">
              <div>{dayjs(notice.createdAt).format('YYYY년 MM월 DD일 HH:mm')}</div>
              <div>{notice.title}</div>
            </div>
            <AdminPopoverMenu>
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <AdminPopoverEditButton onEdit={() => setEditOpen(true)} />
                <NoticeModal type="edit" noticeId={notice.noticeId} closeModal={() => setEditOpen(false)} />
              </Dialog>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AdminPopoverDeleteButton onDelete={() => setDeleteOpen(true)} />
                <NoticeDeleteConfirmModal noticeId={notice.noticeId} closeModal={() => setDeleteOpen(false)} />
              </Dialog>
            </AdminPopoverMenu>
          </AdminCardRow>
        ))}
        {notices?.length === 0 && <AdminNoData />}
      </div>
    </AdminCard>
  );
};

export default AllNoticeListSection;
