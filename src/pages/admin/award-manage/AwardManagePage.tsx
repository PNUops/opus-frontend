import { useQuery } from '@tanstack/react-query';
import { useAwardViewAdmin } from 'hooks/useAwardAdmin';
import { AdminHeader } from '@components/ui/admin';
import AwardEditForm from './AwardEditForm';

const AwardManagePage = () => {
  const contestId = 1; // TODO: 현재 선택된 공모전 ID로 변경 필요
  const viewAdmin = useAwardViewAdmin(contestId);

  return (
    <div className="flex w-full flex-col">
      <AdminHeader title="수상 관리" />
      <div className="h-[35px]" />
      <AwardEditForm contestId={contestId} />
    </div>
  );
};

export default AwardManagePage;
