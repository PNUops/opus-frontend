import { useSuspenseQuery } from '@tanstack/react-query';
import { NoticeList, NoticeListItem, NoticeListNoData } from '@components/notice';
import { useContestIdOrRedirect } from 'hooks/useId';
import { contestNoticeOption } from 'queries/notices';

const ContestNoticeList = () => {
  const contestId = useContestIdOrRedirect();
  const { data: notices } = useSuspenseQuery(contestNoticeOption(contestId));

  return (
    <NoticeList>
      {notices.length === 0 && <NoticeListNoData />}
      {notices.slice(0, 3).map((notice) => (
        <NoticeListItem key={notice.noticeId} {...notice} contestId={contestId} />
      ))}
    </NoticeList>
  );
};

export default ContestNoticeList;
