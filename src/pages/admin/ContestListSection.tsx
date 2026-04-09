import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { IoIosArrowForward } from 'react-icons/io';
import { AdminCard, AdminCardCreateButton, AdminCardRow, AdminCardTop } from '@components/admin';
import { NoData } from '@components/NoData';
import { contestsOption } from '@queries/contest';
import QueryWrapper from '@providers/QueryWrapper';

const ContentListSection = () => {
  return (
    <AdminCard>
      <AdminCardTop>
        <h2 className="text-2xl font-bold">대회 목록</h2>
        <AdminCardCreateButton>
          <Link to={`/admin/contest/create`}>{'+ 새 대회'}</Link>
        </AdminCardCreateButton>
      </AdminCardTop>
      <div className="flex max-h-[300px] flex-col gap-[15px] overflow-y-auto p-2.5">
        <QueryWrapper loadingStyle="h-50 rounded-lg" errorStyle="h-50">
          <ContestList />
        </QueryWrapper>
      </div>
    </AdminCard>
  );
};

export default ContentListSection;

const ContestList = () => {
  const { data: contests } = useSuspenseQuery(contestsOption());

  if (contests.length === 0) return <NoData />;

  return contests.map((contest) => (
    <Link key={contest.contestId} to={`/admin/contest/${contest.contestId}`}>
      <AdminCardRow className="group rounded-lg hover:bg-blue-100">
        <div className="flex items-center gap-2.5">
          <div>{contest.contestName}</div>
          <div className="bg-lightGray text-midGray rounded-3xl px-2.5 py-0.5 text-[14px]">{contest.categoryName}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-mainBlue hidden text-xs group-hover:block">대회 설정 페이지로 이동</div>
          <IoIosArrowForward className="group-hover:fill-mainBlue fill-midGray" />
        </div>
      </AdminCardRow>
    </Link>
  ));
};
