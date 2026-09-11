import type { RoleName } from "@/types/auth";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  member: {
    dashboard: "/member/dashboard",
    reports: "/member/reports",
    reportsNew: "/member/reports/new",
    reportsHistory: "/member/reports/history",
    reportDetail: "/member/reports/:reportId",
  },
  manager: {
    dashboard: "/manager/dashboard",
    reports: "/manager/reports",
    review: "/manager/review",
    users: "/manager/users",
    projects: "/manager/projects",
    taskTypes: "/manager/task-types",
  },
} as const;

export type AppRoutePath =
  | typeof ROUTES.home
  | typeof ROUTES.login
  | typeof ROUTES.register
  | (typeof ROUTES.member)[keyof typeof ROUTES.member]
  | (typeof ROUTES.manager)[keyof typeof ROUTES.manager];

export function getDefaultDashboardPath(role: RoleName): string {
  if (role === "MANAGER") {
    return ROUTES.manager.dashboard;
  }

  return ROUTES.member.dashboard;
}

export function isMemberPath(pathname: string): boolean {
  return pathname.startsWith("/member");
}

export function isManagerPath(pathname: string): boolean {
  return pathname.startsWith("/manager");
}

export function memberReportDetailPath(reportId: string): string {
  return `/member/reports/${reportId}`;
}
