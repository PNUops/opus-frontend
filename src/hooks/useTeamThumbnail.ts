import { useQuery } from '@tanstack/react-query';
import basicThumbnail from '@assets/basicThumbnail.jpg';
import { getThumbnail, ThumbnailResult } from '@apis/projectEditor';

export const teamThumbnailQueryKey = (teamId: number | null) => ['thumbnail', teamId] as const;

const useTeamThumbnail = (teamId: number) => {
  const query = useQuery<ThumbnailResult, Error, string | null>({
    queryKey: teamThumbnailQueryKey(teamId),
    queryFn: () => getThumbnail(teamId),
    enabled: teamId > 0,
    staleTime: 5 * 60 * 1000,
    select: (thumbnail) => (thumbnail.status === 'success' ? thumbnail.url : null),
  });

  return {
    ...query,
    thumbnailUrl: query.data ?? basicThumbnail,
  };
};

export default useTeamThumbnail;
