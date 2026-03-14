import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useContestIdOrRedirect } from 'hooks/useId';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import Tag from '@components/Tag';
import {
  AdminHeader,
  AdminCardRow,
  AdminPopoverMenu,
  AdminPopoverEditButton,
  AdminPopoverDeleteButton,
} from '@components/admin';
import { Dialog } from '@components/ui/dialog';
import { contestNoticeOption } from 'queries/notices';
import { ContestNoticeModal, ContestNoticeDeleteConfirmModal } from './ContestNoticeModal';

const NoticeManagePage = () => {
  const contestId = useContestIdOrRedirect();
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState<number | null>(null);

  const { data: notices } = useQuery(contestNoticeOption(contestId));

  return (
    <div className="flex w-full flex-col">
      <AdminHeader
        title="공지 관리"
        description="공지사항의 제목과 작성 일시를 관리합니다."
        buttonLabel="+ 새 공지"
        onButtonClick={() => setCreateOpen(true)}
      />
      <div className="h-[35px]" />
      <div className="flex flex-col gap-2">
        {!notices || notices.length === 0 ? (
          <div className="bg-whiteGray text-midGray rounded-md p-4 text-center">아직 등록된 공지사항이 없어요.</div>
        ) : (
          notices.map((notice, index) => (
            <AdminCardRow key={notice.noticeId} className={twMerge('border-lightGray', 'even:bg-slate-50')}>
              <div className="flex w-full items-center gap-4 py-1">
                <p className="text-midGray w-10 flex-shrink-0 text-center text-sm">{(index ?? 0) + 1}</p>
                <div className="flex min-w-0 flex-1 items-center gap-6">
                  <p className="text-darkGray flex-1 truncate font-medium">{notice.title}</p>
                </div>
                <div className="flex w-[180px] flex-shrink-0 justify-center">
                  <Tag className="border-mainGreen bg-subGreen text-mainGreen w-fit border px-2 py-0.5 text-xs whitespace-nowrap">
                    {dayjs(notice.createdAt).format('YYYY. MM. DD. HH:mm')}
                  </Tag>
                </div>
                <div className="flex w-10 flex-shrink-0 justify-end">
                  <AdminPopoverMenu>
                    <AdminPopoverEditButton
                      onEdit={() => {
                        setSelectedNoticeId(notice.noticeId);
                        setEditOpen(true);
                      }}
                    />
                    <AdminPopoverDeleteButton
                      onDelete={() => {
                        setSelectedNoticeId(notice.noticeId);
                        setDeleteOpen(true);
                      }}
                    />
                  </AdminPopoverMenu>
                </div>
              </div>
            </AdminCardRow>
          ))
        )}
      </div>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        {contestId && (
          <ContestNoticeModal
            type="create"
            contestId={contestId}
            isOpen={createOpen}
            closeModal={() => setCreateOpen(false)}
          />
        )}
      </Dialog>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        {contestId && selectedNoticeId !== null && (
          <ContestNoticeModal
            type="edit"
            contestId={contestId}
            noticeId={selectedNoticeId}
            isOpen={editOpen}
            closeModal={() => setEditOpen(false)}
          />
        )}
      </Dialog>
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        {contestId && selectedNoticeId !== null && (
          <ContestNoticeDeleteConfirmModal
            contestId={contestId}
            noticeId={selectedNoticeId}
            closeModal={() => setDeleteOpen(false)}
          />
        )}
      </Dialog>
    </div>
  );
};

export default NoticeManagePage;
