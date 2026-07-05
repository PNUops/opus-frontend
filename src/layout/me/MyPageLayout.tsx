import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import FullContainerLayout from '@layout/FullContainerLayout';
import LayoutSideBar from '@layout/common/LayoutSideBar';
import { createMyPageSidebarData } from '@constants/myPageSidebarData';
import useAuth from '@hooks/useAuth';
import { getMyProjects } from '@apis/me';
import { advisorContestsOption } from '@queries/advisor';
import { MY_PROJECTS_QUERY_KEY } from '@queries/me';

const MyPageLayout = () => {
  const { isSignedIn, isAdvisor } = useAuth();
  const { data: fetchedMyProjects } = useQuery({
    queryKey: MY_PROJECTS_QUERY_KEY,
    queryFn: getMyProjects,
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1000,
  });
  const { data: advisorContests = [] } = useQuery({
    ...advisorContestsOption(),
    enabled: isSignedIn && isAdvisor,
  });
  const myProjects = useMemo(() => fetchedMyProjects ?? [], [fetchedMyProjects]);
  const sidebarSections = useMemo(
    () => createMyPageSidebarData(myProjects, { advisorContests, showAdvisorActivity: isAdvisor }),
    [advisorContests, isAdvisor, myProjects],
  );

  if (!isSignedIn) {
    return (
      <div className="w-full rounded bg-white p-6 text-center shadow-md">
        <p className="text-mainRed text-xl">로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col md:flex-row">
      <div className="w-full md:w-[272px] md:max-w-[272px] md:min-w-[272px]">
        <LayoutSideBar sections={sidebarSections} />
      </div>
      <div className="flex-1">
        <FullContainerLayout />
      </div>
    </div>
  );
};

export default MyPageLayout;
