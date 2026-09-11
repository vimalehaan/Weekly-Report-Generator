import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { MemberLayout } from "@/layouts/MemberLayout";
import { ManagerLayout } from "@/layouts/ManagerLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { RoleHomeRedirect } from "@/pages/common/RoleHomeRedirect";
import { MemberDashboardPage } from "@/pages/member/MemberDashboardPage";
import { NewReportPage } from "@/pages/member/NewReportPage";
import { MemberReportDetailPage } from "@/pages/member/MemberReportDetailPage";
import { MemberReportHistoryPage } from "@/pages/member/MemberReportHistoryPage";
import { MemberReportVersionDetailPage } from "@/pages/member/MemberReportVersionDetailPage";
import { MemberReportVersionsPage } from "@/pages/member/MemberReportVersionsPage";
import { MemberReportsPage } from "@/pages/member/MemberReportsPage";
import { ManagerDashboardPage } from "@/pages/manager/ManagerDashboardPage";
import { ManagerProjectsPage } from "@/pages/manager/ManagerProjectsPage";
import { ManagerReportDetailPage } from "@/pages/manager/ManagerReportDetailPage";
import { ManagerReportsPage } from "@/pages/manager/ManagerReportsPage";
import { ManagerReviewPage } from "@/pages/manager/ManagerReviewPage";
import { ManagerTaskTypesPage } from "@/pages/manager/ManagerTaskTypesPage";
import { ManagerUserDetailPage } from "@/pages/manager/ManagerUserDetailPage";
import { ManagerUsersPage } from "@/pages/manager/ManagerUsersPage";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { PublicRoute } from "@/routes/PublicRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { ROUTES } from "@/routes/paths";

export const appRouter = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          {
            path: ROUTES.login,
            element: <LoginPage />,
          },
          {
            path: ROUTES.register,
            element: <RegisterPage />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: ROUTES.home,
        element: <RoleHomeRedirect />,
      },
      {
        element: <RoleRoute allowedRoles={["TEAM_MEMBER"]} />,
        children: [
          {
            element: <MemberLayout />,
            children: [
              {
                path: ROUTES.member.dashboard,
                element: <MemberDashboardPage />,
              },
              {
                path: ROUTES.member.reports,
                element: <MemberReportsPage />,
              },
              {
                path: ROUTES.member.reportsNew,
                element: <NewReportPage />,
              },
              {
                path: ROUTES.member.reportsHistory,
                element: <MemberReportHistoryPage />,
              },
              {
                path: ROUTES.member.reportVersionDetail,
                element: <MemberReportVersionDetailPage />,
              },
              {
                path: ROUTES.member.reportVersions,
                element: <MemberReportVersionsPage />,
              },
              {
                path: ROUTES.member.reportDetail,
                element: <MemberReportDetailPage />,
              },
            ],
          },
        ],
      },
      {
        element: <RoleRoute allowedRoles={["MANAGER"]} />,
        children: [
          {
            element: <ManagerLayout />,
            children: [
              {
                path: ROUTES.manager.dashboard,
                element: <ManagerDashboardPage />,
              },
              {
                path: ROUTES.manager.reports,
                element: <ManagerReportsPage />,
              },
              {
                path: ROUTES.manager.reportDetail,
                element: <ManagerReportDetailPage />,
              },
              {
                path: ROUTES.manager.review,
                element: <ManagerReviewPage />,
              },
              {
                path: ROUTES.manager.users,
                element: <ManagerUsersPage />,
              },
              {
                path: ROUTES.manager.userDetail,
                element: <ManagerUserDetailPage />,
              },
              {
                path: ROUTES.manager.projects,
                element: <ManagerProjectsPage />,
              },
              {
                path: ROUTES.manager.taskTypes,
                element: <ManagerTaskTypesPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
