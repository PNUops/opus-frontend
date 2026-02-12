import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { IoIosArrowForward } from 'react-icons/io';
import { AdminCard, AdminCardTop, AdminCardCreateButton, AdminCardRow, AdminNoData } from '@components/ui/admin';
import { contestOption } from 'queries/contests';

const ContentListSection = () => {
  const { data: contests } = useQuery(contestOption());

  return (
    <AdminCard>
      <AdminCardTop>
        <h2 className="text-2xl font-bold">대회 목록</h2>
        <AdminCardCreateButton>
          <Link to={`/admin/contest/create`}>{'+ 새 대회'}</Link>
        </AdminCardCreateButton>
      </AdminCardTop>
      <div className="flex max-h-[300px] flex-col gap-[15px] overflow-y-auto p-2.5">
        {contests?.map((contest) => (
          <Link key={contest.contestId} to={`/admin/contest/${contest.contestId}`}>
            <AdminCardRow className="group rounded-lg hover:bg-blue-100">
              <div className="flex items-center gap-2.5">
                <div>{contest.contestName}</div>
                <div className="bg-lightGray text-midGray rounded-3xl px-2.5 py-0.5 text-[14px]">
                  {contest.categoryName}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-mainBlue hidden text-xs group-hover:block">대회 설정 페이지로 이동</div>
                <IoIosArrowForward className="group-hover:fill-mainBlue fill-midGray" />
              </div>
            </AdminCardRow>
          </Link>
        ))}
        {contests?.length === 0 && <AdminNoData />}
      </div>
    </AdminCard>
  );
};

export default ContentListSection;
