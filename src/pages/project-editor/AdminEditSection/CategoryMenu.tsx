import { useQuery } from '@tanstack/react-query';

import { getContestTracks } from 'apis/track';
import Menu, { MenuOption } from 'components/Menu';
import { ContestTrackDto } from 'types/DTO';

interface CategoryMenuProps {
  contestId: number | null;
  value: number | null;
  onChange: (id: number) => void;
}

const CategoryMenu = ({ contestId, value, onChange }: CategoryMenuProps) => {
  const {
    data: tracks,
    isLoading,
    isError,
  } = useQuery<ContestTrackDto[]>({
    queryKey: ['tracks', contestId],
    queryFn: async () => {
      if (contestId === null) return [];
      return getContestTracks(contestId);
    },
    enabled: contestId !== null,
  });

  const options: MenuOption<number>[] = (tracks ?? []).map((track) => ({
    value: track.trackId,
    label: track.trackName,
  }));

  return (
    <Menu<number>
      options={options}
      value={value}
      onChange={onChange}
      placeholder="트랙을 선택해주세요."
      loading={isLoading}
      error={isError ? '데이터를 가져오지 못했습니다.' : undefined}
      emptyMessage={contestId === null ? '대회를 먼저 선택해주세요.' : '등록된 트랙이 없어요.'}
    />
  );
};

export default CategoryMenu;
