import { useSuspenseQuery } from '@tanstack/react-query';
import { NoticeList, NoticeListItem, NoticeListNoData } from '@components/notice';
import { noticeOption } from 'queries/notices';

const AllNoticeList = () => {
  const { data: notices } = useSuspenseQuery(noticeOption());

  return (
    <NoticeList>
      {notices.length === 0 && <NoticeListNoData />}
      {notices.slice(0, 3).map((notice) => (
        <NoticeListItem key={notice.noticeId} {...notice} />
      ))}
    </NoticeList>
  );
};

export default AllNoticeList;
