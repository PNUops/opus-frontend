import { createBrowserRouter, Navigate } from 'react-router-dom';

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
import AdminLayout from '@layout/admin/AdminLayout';
import AdminContestLayout from '@layout/admin/contest/AdminContestLayout';
import FullContainer from '@layout/FullContainer';

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
          element: <AdminLayout />,
          children: [
            {
              element: (
                <FullContainer>
                  <AdminPage />
                  {/* // TODO: 레거시 페이지이므로 추후 제거 필요 */}
                </FullContainer>
              ),
              children: [{ index: true, element: <Navigate to="ongoing" /> }, ...AdminTabs],
            },
            {
              path: 'contest/:contestId',
              element: <AdminContestLayout />,
              children: [
                { index: true, element: <Navigate to="projects" replace /> },
                // 프로젝트
                { path: 'projects', element: <div>프로젝트 관리</div> },
                { path: 'team-order', element: <div>정렬 관리</div> },
                { path: 'awards', element: <div>수상 관리</div> },
                { path: 'required-fields', element: <div>필수 항목 설정</div> },
                // 대회
                { path: 'settings', element: <div>대회 관리</div> },
                { path: 'departments', element: <div>분과 관리</div> },
                { path: 'votes', element: <div>투표 관리</div> },
                { path: 'notices', element: <div>공지 관리</div> },
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
