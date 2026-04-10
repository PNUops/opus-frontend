import { useQuery } from '@tanstack/react-query';
import { AdminHeader } from '@components/admin';
import { sortStatusOption } from '@queries/contest';
import { useContestIdOrRedirect } from '@hooks/useId';
import QueryWrapper from '@providers/QueryWrapper';
import SortSelect from './SortSelect';
import CustomOrderSection from './CustomOrderSection';

const SortManagePage = () => {
  const contestId = useContestIdOrRedirect();
  const { data: currentSortOption } = useQuery(sortStatusOption(contestId));

  return (
    <div className="flex flex-col gap-12">
      <AdminHeader title="정렬 관리" description="프로젝트의 정렬 순서를 변경할 수 있습니다.">
        <QueryWrapper loadingStyle="h-10 w-50 rounded-sm my-0" errorStyle="h-10">
          <SortSelect />
        </QueryWrapper>
      </AdminHeader>
      <QueryWrapper loadingStyle="h-100 rounded-sm my-0" errorStyle="h-100">
        {currentSortOption === 'CUSTOM' && <CustomOrderSection />}
      </QueryWrapper>
    </div>
  );
};

export default SortManagePage;
