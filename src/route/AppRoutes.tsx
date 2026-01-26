import { createBrowserRouter, Navigate } from 'react-router-dom';

import MainLayout from '@layout/MainLayout';

import MainPage from '@pages/main/MainPage';
import ProjectEditorPage from '@pages/project-editor/ProjectEditorPage';
import ProjectViewerPage from '@pages/project-viewer/ProjectViewerPage';
import SignInPage from '@pages/signin/SignInPage';
import SignUpPage from '@pages/signup/SignUpPage';
import FindPage from '@pages/find/FindPage';
import GoogleOAuthCallback from '@pages/signin/SocialSignIn/GoogleOAuthCallback';
import NoticeDetail from '@pages/notice/NoticeDetail';
import ContestPage from '@pages/contest/ContestPage';
import FullContainerLayout from '@layout/FullContainerLayout';
import AdminLayout from '@layout/admin/AdminLayout';
import AdminContestLayout from '@layout/admin/contest/AdminContestLayout';
import FullContainer from '@layout/FullContainer';
import AdminDashBoardPage from '@pages/admin/AdminDashBoardPage';
import ProjectManagePage from '@pages/admin/project-manage/ProjectManagePage';
import SidebarLayout from '@layout/SidebarLayout';
import TeamOrderAdminPage from '@pages/admin/team-order/TeamOrderAdminPage';
import TrackManagePage from '@pages/admin/track-manage/TrackManagePage';
import NoticeManagePage from '@pages/admin/notice-manage/NoticeManagePage';
import AwardManagePage from '@pages/admin/award-manage/AwardManagePage';
import MyPageLayout from '@pages/account/MyPageLayout';
import AccountManagePage from '@pages/account/AccountManagePage';
import NoticeCreateTab from '@pages/admin/NoticeManageTab/NoticeCreateTab';

const AppRoutes = () =>
  createBrowserRouter([
    {
      path: '/',
      element: <MainLayout />,
      children: [
        {
          element: <SidebarLayout />,
          children: [
            { index: true, element: <MainPage /> },
            { path: 'contest/:contestId', element: <ContestPage /> },
          ],
        },
        {
          element: <FullContainerLayout />,
          children: [
            { path: 'signin', element: <SignInPage /> },
            { path: 'signup', element: <SignUpPage /> },
            { path: 'teams/view/:teamId', element: <ProjectViewerPage /> },
            { path: 'teams/edit/:teamId', element: <ProjectEditorPage mode="edit" /> },
            { path: 'find', element: <FindPage /> },
            { path: 'oauth/google/callback', element: <GoogleOAuthCallback /> },
            { path: 'notices/:noticeId', element: <NoticeDetail /> },
          ],
        },
        { path: 'myaccount', element: <MyPageLayout />, children: [{ index: true, element: <AccountManagePage /> }] },
        {
          path: 'admin',
          element: <AdminLayout />,
          children: [
            {
              element: (
                <FullContainer>
                  <AdminDashBoardPage />
                </FullContainer>
              ),
              children: [{ index: true, element: <Navigate to="ongoing" /> }],
            },
            {
              path: 'contest/:contestId',
              element: <AdminContestLayout />,
              children: [
                { index: true, element: <Navigate to="projects" replace /> },
                // 프로젝트
                { path: 'projects', element: <ProjectManagePage /> },
                // 프로젝트 생성
                { path: 'projects/create', element: <ProjectEditorPage mode="create" /> },
                { path: 'sort', element: <div>정렬 관리</div> },
                { path: 'team-order', element: <TeamOrderAdminPage /> },
                { path: 'awards', element: <AwardManagePage /> },
                { path: 'required-fields', element: <div>필수 항목 설정</div> },
                // 대회
                { path: 'settings', element: <div>대회 관리</div> },
                { path: 'tracks', element: <TrackManagePage /> },
                { path: 'votes', element: <div>투표 관리</div> },
                { path: 'notices', element: <NoticeManagePage /> },
                { path: 'notices/create', element: <NoticeCreateTab /> },
                { path: 'banners', element: <div>배너 관리</div> },
                // 통계
                { path: 'statistics', element: <div>대회 통계</div> },
              ],
            },
          ],
        },
      ],
    },
  ]);

export default AppRoutes;
