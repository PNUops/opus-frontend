import { useState } from 'react';
import {
  AdminCard,
  AdminCardTop,
  AdminCardCreateButton,
  AdminCardRow,
  AdminPopoverMenu,
  AdminPopoverEditButton,
  AdminPopoverDeleteButton,
} from '@components/ui/admin';
import { Dialog, DialogTrigger } from '@components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { getNotices } from 'apis/notices';
import dayjs from 'dayjs';
import { NoticeModal } from './NoticeModal';

const AllNoticeListSection = () => {
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

  const { data: notices } = useQuery({
    queryKey: ['notices'],
    queryFn: getNotices,
  });

  return (
    <AdminCard>
      <AdminCardTop>
        <h2 className="text-2xl font-bold">전체 공지사항 목록</h2>
        <Dialog>
          <DialogTrigger asChild>
            <AdminCardCreateButton>+ 새 공지</AdminCardCreateButton>
          </DialogTrigger>
          <NoticeModal type="create" />
        </Dialog>
      </AdminCardTop>
      <div>
        {notices?.map((notice) => (
          <AdminCardRow key={notice.noticeId} className="border-midGray not-last:border-b">
            <div className="flex gap-5">
              <div>{notice.noticeId}</div>
              <div>{dayjs(notice.createdAt).format('YYYY년 MM월 DD일 HH:mm')}</div>
              <div>{notice.title}</div>
            </div>
            <AdminPopoverMenu>
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <AdminPopoverEditButton onEdit={() => setEditOpen(true)} />
                <NoticeModal type="edit" noticeId={notice.noticeId} />
              </Dialog>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AdminPopoverDeleteButton onDelete={() => setDeleteOpen(false)} />
              </Dialog>
            </AdminPopoverMenu>
          </AdminCardRow>
        ))}
      </div>
    </AdminCard>
  );
};

export default AllNoticeListSection;
