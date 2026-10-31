import { lazy, type ComponentType } from 'react';
import DeferredContent from '@components/DeferredContent';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import MainLayout from '@layout/MainLayout';
import AuthLayout from '@layout/AuthLayout';

import MainPage from '@pages/main/MainPage';
import FullContainerLayout from '@layout/FullContainerLayout';
import AdminLayout from '@layout/admin/AdminLayout';
import AdminContestLayout from '@layout/admin/contest/AdminContestLayout';
import FullContainer from '@layout/FullContainer';
import SidebarLayout from '@layout/SidebarLayout';
import MyPageLayout from '@layout/me/MyPageLayout';

const lazyPage = (load: () => Promise<{ default: ComponentType }>) => {
  const Page = lazy(load);
  return function LazyPage() {
    return (
      <DeferredContent>
        <Page />
      </DeferredContent>
    );
  };
};

const ProjectEditPage = lazyPage(() => import('@pages/project-editor/ProjectEditPage'));
const ProjectDetailPage = lazyPage(() => import('@pages/project-viewer/ProjectDetailPage'));
const SignInPage = lazyPage(() => import('@pages/signin/SignInPage'));
const SignUpPage = lazyPage(() => import('@pages/signup/SignUpPage'));
const FindPage = lazyPage(() => import('@pages/find/FindPage'));
const OAuthCallback = lazyPage(() => import('@pages/signin/SocialSignIn/OAuthCallback'));
const NoticeDetailPage = lazyPage(() => import('@pages/notice/NoticeDetailPage'));
const NoticeListPage = lazyPage(() => import('@pages/notice/NoticeListPage'));
const ContestPage = lazyPage(() => import('@pages/contest/ContestPage'));
const AdminDashBoardPage = lazyPage(() => import('@pages/admin/AdminDashBoardPage'));
const ProjectManagePage = lazyPage(() => import('@pages/admin/project-manage/ProjectManagePage'));
const SortManagePage = lazyPage(() => import('@pages/admin/sort/SortManagePage'));
const RequiredFieldsPage = lazyPage(() => import('@pages/admin/required-field/RequiredFieldsPage'));
const TrackManagePage = lazyPage(() => import('@pages/admin/track-manage/TrackManagePage'));
const NoticeManagePage = lazyPage(() => import('@pages/admin/notice-manage/NoticeManagePage'));
const AwardManagePage = lazyPage(() => import('@pages/admin/award-manage/AwardManagePage'));
const ContestCreatePage = lazyPage(() => import('@pages/admin/create/ContestCreatePage'));
const BannerManagePage = lazyPage(() => import('@pages/admin/banner/BannerManagePage'));
const NotFoundPage = lazyPage(() => import('@pages/common/NotFoundPage'));
const VoteManagePage = lazyPage(() => import('@pages/admin/votes/VoteManagePage'));
const ContestManagePage = lazyPage(() => import('@pages/admin/contest-manage/ContestManagePage'));
const ContestStatisticsPage = lazyPage(() => import('@pages/admin/statistics/ContestStatisticsPage'));
const TeamSettingPage = lazyPage(() => import('@pages/admin/team-setting/TeamSettingPage'));
const ActivityPage = lazyPage(() => import('@pages/me/activity/ActivityPage'));
const AccountPage = lazyPage(() => import('@pages/me/account/AccountPage'));
const MyLikePage = lazyPage(() => import('@pages/me/activity/sub/MyLikePage'));
const MyCommentPage = lazyPage(() => import('@pages/me/activity/sub/MyCommentPage'));
const MySubmissionPage = lazyPage(() => import('@pages/me/activity/submission/MySubmissionPage'));
const SubmissionManagePage = lazyPage(() => import('@pages/admin/submission-manage/SubmissionManagePage'));
const TeamDashboardPage = lazyPage(() => import('@pages/me/team/TeamDashboardPage'));
const RoleAssignmentPage = lazyPage(() => import('@pages/admin/role-assignment/RoleAssignmentPage'));
const AdvisorActivityPage = lazyPage(() => import('@pages/me/advisor-activity/AdvisorActivityPage'));

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
            {
              element: <FullContainerLayout />,
              children: [{ path: 'contest/:contestId', element: <ContestPage /> }],
            },
          ],
        },
        {
          element: <AuthLayout />,
          children: [
            { path: 'signin', element: <SignInPage /> },
            { path: 'signup', element: <SignUpPage /> },
          ],
        },
        {
          element: <FullContainerLayout />,
          children: [
            { path: 'contest/:contestId/teams/edit/:teamId', element: <ProjectEditPage /> },
            { path: 'find', element: <FindPage /> },
            { path: 'oauth/callback', element: <OAuthCallback /> },
            { path: 'notices', element: <NoticeListPage /> },
            { path: 'notices/:noticeId', element: <NoticeDetailPage /> },
            { path: 'notices/:contestId/:noticeId', element: <NoticeDetailPage /> },
          ],
        },
        {
          path: 'contest/:contestId/teams/view/:teamId',
          element: (
            <FullContainer fillViewport={false}>
              <ProjectDetailPage />
            </FullContainer>
          ),
        },
        {
          path: 'me',
          element: <MyPageLayout />,
          children: [
            { index: true, element: <Navigate to="activity" replace /> },
            { path: 'activity', element: <ActivityPage /> },
            { path: 'activity/likes', element: <MyLikePage /> },
            { path: 'activity/comments', element: <MyCommentPage /> },
            { path: 'activity/:teamId/submission', element: <MySubmissionPage /> },
            { path: 'advisor-activity', element: <AdvisorActivityPage /> },
            { path: 'advisor-activity/contests/:contestId', element: <AdvisorActivityPage /> },
            {
              path: 'contests/:contestId/teams/:teamId',
              element: <Navigate to="dashboard" replace />,
            },
            { path: 'contests/:contestId/teams/:teamId/dashboard', element: <TeamDashboardPage /> },
            { path: 'contests/:contestId/teams/:teamId/submissions', element: <MySubmissionPage /> },
            { path: 'account', element: <AccountPage /> },
          ],
        },
        {
          path: 'admin',
          element: <AdminLayout />,
          children: [
            {
              index: true,
              element: (
                <FullContainer>
                  <AdminDashBoardPage />
                </FullContainer>
              ),
            },
            {
              path: 'contest/create',
              element: (
                <FullContainer>
                  <ContestCreatePage />
                </FullContainer>
              ),
            },
            {
              path: 'contest/:contestId',
              element: <AdminContestLayout />,
              children: [
                { index: true, element: <Navigate to="projects" replace /> },
                // 프로젝트
                { path: 'projects', element: <ProjectManagePage /> },
                // 프로젝트 생성
                { path: 'projects/create', element: <ProjectEditPage /> },
                // 제출 자료
                { path: 'submission-manage', element: <SubmissionManagePage /> },
                { path: 'sort', element: <SortManagePage /> },
                { path: 'awards', element: <AwardManagePage /> },
                { path: 'required-fields', element: <RequiredFieldsPage /> },
                // 대회
                { path: 'manage', element: <ContestManagePage /> },
                { path: 'team-setting', element: <TeamSettingPage /> },
                { path: 'roles', element: <RoleAssignmentPage /> },
                { path: 'tracks', element: <TrackManagePage /> },
                { path: 'votes', element: <VoteManagePage /> },
                { path: 'notices', element: <NoticeManagePage /> },
                { path: 'banners', element: <BannerManagePage /> },
                // 통계
                { path: 'statistics', element: <ContestStatisticsPage /> },
              ],
            },
          ],
        },
        { path: '*', element: <NotFoundPage /> },
      ],
    },
  ]);

export default AppRoutes;
