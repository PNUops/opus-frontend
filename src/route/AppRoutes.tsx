import { createBrowserRouter, Link, Outlet, useRoutes } from 'react-router-dom';

import MainLayout from '@layout/MainLayout';

import MainPage from '@pages/main/MainPage';
import ProjectEditorPage from '@pages/project-editor/ProjectEditorPage';
import ProjectViewerPage from '@pages/project-viewer/ProjectViewerPage';
import SignInPage from '@pages/signin/SignInPage';
import SignUpPage from '@pages/signup/SignUpPage';
import AdminPage from '@pages/admin/AdminPage';
import FindPage from '@pages/find/FindPage';
import GoogleOAuthCallback from '@pages/signin/SocialSignIn/GoogleOAuthCallback';
import NoticeDetail from '@pages/notice/NoticeDetail';
import ContestPage from '@pages/contest/ContestPage';
import AdminTabs from './AdminTabs';
import FullContainerLayout from '@layout/FullContainerLayout';

const AppRoutes = () =>
  createBrowserRouter([
    {
      path: '/',
      element: <MainLayout />,
      children: [
        {
          element: <FullContainerLayout />,
          children: [
            { index: true, element: <MainPage /> },
            { path: 'contest/:contestId', element: <ContestPage /> },
            { path: 'signin', element: <SignInPage /> },
            { path: 'signup', element: <SignUpPage /> },
            { path: 'teams/view/:teamId', element: <ProjectViewerPage /> },
            { path: 'teams/edit/:teamId', element: <ProjectEditorPage mode="edit" /> },
            { path: 'find', element: <FindPage /> },
            { path: 'oauth/google/callback', element: <GoogleOAuthCallback /> },
            { path: 'notices/:noticeId', element: <NoticeDetail /> },
          ],
        },
        {
          path: 'admin',
          children: [
            {
              element: <AdminPage />, // TODO: 레거시 페이지이므로 추후 제거 필요
              children: AdminTabs,
            },
            {
              path: 'contest/:contestId',
              // element: 대회 대시보드용 사이드바 레이아웃
            },
          ],
        },
      ],
    },
  ]);

export default AppRoutes;
