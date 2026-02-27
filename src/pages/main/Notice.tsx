// import banner from '@assets/banner.svg';
import NoticeList from '@pages/main/NoticeList';
import { useQuery } from '@tanstack/react-query';
import { getNotices } from '../../apis/notice';
import NoticeListSkeleton from '@pages/main/NoticeListSkeleton';

// techweek
import banner from 'styles/techweek-2025.webp';

const Notice = () => {
  const {
    data: notices,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['notices'],
    queryFn: getNotices,
  });

  const BANNER_URL =
    // 'https://swedu.pusan.ac.kr/swedu/31630/subview.do?enc=Zm5jdDF8QEB8JTJGYmJzJTJGc3dlZHUlMkY2OTA2JTJGMTcxNjIwOCUyRmFydGNsVmlldy5kbyUzRmJic09wZW5XcmRTZXElM0QlMjZpc1ZpZXdNaW5lJTNEZmFsc2UlMjZzcmNoQ29sdW1uJTNEc2olMjZwYWdlJTNEMSUyNnNyY2hXcmQlM0QlMjVFQyUyNUIwJTI1QkQlMjVFQyUyNTlEJTI1OTglMjVFQyUyNTlDJTI1QjUlMjVFRCUyNTk1JTI1QTklMjZyZ3NCZ25kZVN0ciUzRCUyNmJic0NsU2VxJTNEJTI2cGFzc3dvcmQlM0QlMjZyZ3NFbmRkZVN0ciUzRCUyNg%3D%3D';
    'https://cse.pusan.ac.kr/cse/14655/subview.do';
  return (
    <div className="flex flex-col gap-4">
      <a href={BANNER_URL} target="_blank" className="flex min-h-25">
        <img src={banner} alt="대회 로고" className="flex cursor-pointer object-cover object-center" />
        {/* techweek: 기존 object-left */}
      </a>
      {isLoading && <NoticeListSkeleton />}
      {isError && <div>공지사항을 불러올 수 없습니다.</div>}
      {!isLoading && !isError && notices && <NoticeList notices={notices} />}
    </div>
  );
};

export default Notice;
