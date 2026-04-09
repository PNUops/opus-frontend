import { useQuery } from '@tanstack/react-query';

import { getAllContests } from '@apis/contest';
import Menu, { MenuOption } from '@components/Menu';
import { ContestResponseDto } from '@dto/contestsDto';

interface ContestMenuProps {
  value: number | null;
  onChange: (id: number) => void;
}

const ContestMenu = ({ value, onChange }: ContestMenuProps) => {
  const {
    data: contests,
    isLoading,
    isError,
  } = useQuery<ContestResponseDto[]>({
    queryKey: ['contests'],
    queryFn: async () => getAllContests(),
  });

  const options: MenuOption<number>[] = (contests ?? []).map((contest) => ({
    value: contest.contestId,
    label: contest.contestName,
  }));

  return (
    <Menu<number>
      options={options}
      value={value}
      onChange={onChange}
      placeholder="대회를 선택해주세요."
      loading={isLoading}
      error={isError ? '데이터를 가져오지 못했습니다.' : undefined}
      emptyMessage="다시 시도해주세요."
    />
  );
};

export default ContestMenu;
