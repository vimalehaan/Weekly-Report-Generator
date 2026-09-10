import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { MemberLayout } from "@/layouts/MemberLayout";
import { ManagerLayout } from "@/layouts/ManagerLayout";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { RoleHomeRedirect } from "@/pages/common/RoleHomeRedirect";
import { MemberDashboardPage } from "@/pages/member/MemberDashboardPage";
import { MemberNewReportPage } from "@/pages/member/MemberNewReportPage";
import { MemberReportHistoryPage } from "@/pages/member/MemberReportHistoryPage";
import { MemberReportsPage } from "@/pages/member/MemberReportsPage";
import { ManagerDashboardPage } from "@/pages/manager/ManagerDashboardPage";
import { ManagerProjectsPage } from "@/pages/manager/ManagerProjectsPage";
import { ManagerReportsPage } from "@/pages/manager/ManagerReportsPage";
import { ManagerReviewPage } from "@/pages/manager/ManagerReviewPage";
import { ManagerTaskTypesPage } from "@/pages/manager/ManagerTaskTypesPage";
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
                element: <MemberNewReportPage />,
              },
              {
                path: ROUTES.member.reportsHistory,
                element: <MemberReportHistoryPage />,
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
                path: ROUTES.manager.review,
                element: <ManagerReviewPage />,
              },
              {
                path: ROUTES.manager.users,
                element: <ManagerUsersPage />,
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
