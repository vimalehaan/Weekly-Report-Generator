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
    reportVersions: "/member/reports/:reportId/versions",
    reportVersionDetail:
      "/member/reports/:reportId/versions/:versionNumber",
  },
  manager: {
    dashboard: "/manager/dashboard",
    reports: "/manager/reports",
    reportDetail: "/manager/reports/:reportId",
    review: "/manager/review",
    users: "/manager/users",
    userDetail: "/manager/users/:userId",
    projects: "/manager/projects",
    projectsNew: "/manager/projects/new",
    projectDetail: "/manager/projects/:projectId",
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

export function memberReportVersionsPath(reportId: string): string {
  return `/member/reports/${reportId}/versions`;
}

export function memberReportVersionDetailPath(
  reportId: string,
  versionNumber: number,
): string {
  return `/member/reports/${reportId}/versions/${versionNumber}`;
}

export function isMemberReportVersionsPath(pathname: string): boolean {
  return /\/member\/reports\/[^/]+\/versions(\/|$)/.test(pathname);
}

export function managerReportDetailPath(reportId: string): string {
  return `/manager/reports/${reportId}`;
}

export function isManagerReportDetailPath(pathname: string): boolean {
  return /^\/manager\/reports\/[^/]+$/.test(pathname);
}

export function managerUserDetailPath(userId: string): string {
  return `/manager/users/${userId}`;
}

export function isManagerUserDetailPath(pathname: string): boolean {
  return /^\/manager\/users\/[^/]+$/.test(pathname);
}

export function managerProjectDetailPath(projectId: string): string {
  return `/manager/projects/${projectId}`;
}

export function isManagerProjectPath(pathname: string): boolean {
  return (
    pathname === ROUTES.manager.projects ||
    pathname === ROUTES.manager.projectsNew ||
    /^\/manager\/projects\/[^/]+$/.test(pathname)
  );
}
