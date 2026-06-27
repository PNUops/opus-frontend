import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import FullContainerLayout from '@layout/FullContainerLayout';
import LayoutSideBar from '@layout/common/LayoutSideBar';
import { createMyPageSidebarData } from '@constants/myPageSidebarData';
import useAuth from '@hooks/useAuth';
import { getMyProjects } from '@apis/me';
import { MY_PROJECTS_QUERY_KEY } from '@queries/me';
import { mockMyProjects } from '@pages/me/team/mockTeamDashboard';

const MyPageLayout = () => {
  const { isSignedIn } = useAuth();
  const {
    data: fetchedMyProjects,
    isError: isMyProjectsError,
    isFetched: isMyProjectsFetched,
  } = useQuery({
    queryKey: MY_PROJECTS_QUERY_KEY,
    queryFn: getMyProjects,
    enabled: isSignedIn,
    staleTime: 5 * 60 * 1000,
  });
  const myProjects = useMemo(() => {
    const projects = fetchedMyProjects ?? [];

    if (import.meta.env.DEV && (isMyProjectsError || (isMyProjectsFetched && projects.length === 0))) {
      return mockMyProjects;
    }

    return projects;
  }, [fetchedMyProjects, isMyProjectsError, isMyProjectsFetched]);
  const sidebarSections = useMemo(() => createMyPageSidebarData(myProjects), [myProjects]);

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
