import { useQuery } from '@tanstack/react-query';
import { NoticeListSkeleton } from '@components/notice';
import useContestName from '@hooks/useContestName';
import { useContestIdOrRedirect } from '@hooks/useId';
import QueryWrapper from '@providers/QueryWrapper';
import ContestNoticeList from './ContestNoticeList';
import TeamCardGrid from '@pages/contest/TeamCardGrid';
import { contestTeamOption } from '@queries/contest';
import { API_BASE_URL } from '@constants/env';
import { useState } from 'react';

const ContestPage = () => {
  const contestId = useContestIdOrRedirect();
  const contestName = useContestName();
  const [bannerVisible, setBannerVisible] = useState<boolean>(true);

  const { data: teams, isLoading, isError } = useQuery(contestTeamOption(contestId));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h3 className="lg:text-title text-2xl font-bold">{contestName ?? ''}</h3>
        {bannerVisible && (
          <img
            src={`${API_BASE_URL}/api/contests/${contestId}/image/banner`}
            alt={contestName}
            className="border-lightGray max-h-50 rounded-sm shadow-sm"
            onError={() => setBannerVisible(false)}
          />
        )}
      </div>
      <QueryWrapper loadingFallback={<NoticeListSkeleton />} errorStyle="h-36 rounded-xl shadow-md">
        <ContestNoticeList />
      </QueryWrapper>
      <TeamCardGrid teams={teams} isLoading={isLoading} isError={isError} />
    </div>
  );
};

export default ContestPage;
