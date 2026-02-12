import { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useContestIdOrRedirect } from 'hooks/useId'; // contestId를 가져오는 커스텀 훅 가정
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import ConfirmModal from '@components/ConfirmModal';
import Tag from '@components/Tag';
import {
  AdminHeader,
  AdminCardRow,
  AdminPopoverMenu,
  AdminPopoverEditButton,
  AdminPopoverDeleteButton,
} from '@components/ui/admin';

import { getContestNotices, deleteContestNotice } from 'apis/notices';

const NoticeManagePage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const contestId = useContestIdOrRedirect();
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { data: notices } = useQuery({
    queryKey: ['notices', contestId],
    queryFn: () => getContestNotices(contestId),
    enabled: !!contestId,
  });

  const { mutate: deleteNoticeMutation } = useMutation({
    mutationFn: (noticeId: number) => deleteContestNotice(contestId, noticeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notices', contestId] }),
    onError: () => {},
  });

  const handleDeleteNotice = (noticeId: number) => {
    deleteNoticeMutation(noticeId);
  };

  return (
    <div className="flex w-full flex-col">
      <AdminHeader
        title="공지 관리"
        description="공지사항의 제목과 작성 일시를 관리합니다."
        buttonLabel="+ 새 공지"
        onButtonClick={() => navigate(`/admin/contest/${contestId}/notices/create`)}
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
                      onEdit={() => navigate(`/admin/contest/${contestId}/notices/${notice.noticeId}/edit`)}
                    />
                    <AdminPopoverDeleteButton
                      onDelete={() => {
                        handleDeleteNotice(notice.noticeId);
                      }}
                    />
                  </AdminPopoverMenu>
                </div>
                <ConfirmModal
                  isOpen={deleteTarget !== null}
                  onConfirm={() => {
                    if (deleteTarget !== null) handleDeleteNotice(deleteTarget);
                    setDeleteTarget(null);
                  }}
                  onCancel={() => setDeleteTarget(null)}
                />
              </div>
            </AdminCardRow>
          ))
        )}
      </div>
    </div>
  );
};

export default NoticeManagePage;
