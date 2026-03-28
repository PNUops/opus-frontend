import { useQuery } from '@tanstack/react-query';
import basicThumbnail from '@assets/basicThumbnail.jpg';
import { getThumbnailTeams } from 'apis/team';

export const teamThumbnailQueryKey = (teamId: number) => ['teamThumbnail', teamId] as const;

const useTeamThumbnail = (teamId: number) => {
  const query = useQuery({
    queryKey: teamThumbnailQueryKey(teamId),
    queryFn: () => getThumbnailTeams(teamId),
    enabled: teamId > 0,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    thumbnailUrl: query.data ?? basicThumbnail,
  };
};

export default useTeamThumbnail;
