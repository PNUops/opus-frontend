import { useQuery } from '@tanstack/react-query';

import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import Tag from '@components/Tag';
import {
  AdminCardRow,
  AdminPopoverMenu,
  AdminPopoverEditButton,
  AdminPopoverDeleteButton,
  AdminListLayout,
} from '@components/ui/admin';

import { getNotices } from 'apis/notices';
import { NoticeResponseDto } from 'types/DTO/notices/NoticeResponseDto';

const NoticeManagePage = () => {
  const contestId = 1; // TODO: 현재 선택된 공모전 ID로 변경 필요

  const { data: notices } = useQuery({
    queryKey: ['notices', contestId],
    queryFn: getNotices,
    enabled: !!contestId,
  });

  return (
    <AdminListLayout<NoticeResponseDto>
      title="공지 관리"
      description="제목 | 생성 일시"
      buttonLabel="+ 새 공지"
      onButtonClick={() => alert('공지 생성')}
      items={notices ?? []}
      renderItem={(notice) => (
        <AdminCardRow key={notice.noticeId} className={twMerge('border-lightGray', 'even:bg-slate-50')}>
          <div className="flex w-full items-start gap-3 py-1 md:items-center md:gap-4">
            <p className="text-midGray w-8 flex-shrink-0 text-center text-xs md:w-10 md:text-sm">{notice.noticeId}</p>
            <div className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-center md:gap-6">
              <p className="text-darkGray flex-1 truncate text-sm font-medium md:text-base">{notice.title}</p>
              <div className="flex flex-shrink-0 justify-end">
                <Tag className="border-mainGreen bg-subGreen text-mainGreen w-fit border px-2 py-0.5 text-[10px] md:text-xs">
                  {dayjs(notice.createdAt).format('YYYY년 MM월 DD일 HH:mm')}
                </Tag>
              </div>
            </div>
          </div>
          <div className="flex w-8 flex-shrink-0 justify-end md:w-10">
            <AdminPopoverMenu>
              <AdminPopoverEditButton onEdit={() => alert('공지 수정 훅 호출')} />
              <AdminPopoverDeleteButton
                onDelete={() => {
                  alert(`공지 ${notice.noticeId} 삭제 훅 호출`);
                }}
              />
            </AdminPopoverMenu>
          </div>
        </AdminCardRow>
      )}
    />
  );
};

export default NoticeManagePage;
