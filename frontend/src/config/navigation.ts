import {
  ClipboardList,
  FolderKanban,
  History,
  LayoutDashboard,
  ListChecks,
  Tags,
  Users,
} from "lucide-react";
import {
  isManagerReportDetailPath,
  isManagerUserDetailPath,
  isMemberReportVersionsPath,
  ROUTES,
} from "@/routes/paths";
import type { AppNavItemConfig } from "@/components/layout/AppNavItem";

export const MEMBER_NAV_ITEMS: AppNavItemConfig[] = [
  {
    label: "Dashboard",
    to: ROUTES.member.dashboard,
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "My Reports",
    to: ROUTES.member.reports,
    icon: ClipboardList,
    isActiveMatch: (pathname) => {
      if (
        pathname === ROUTES.member.reportsHistory ||
        isMemberReportVersionsPath(pathname)
      ) {
        return false;
      }

      if (
        pathname === ROUTES.member.reports ||
        pathname === ROUTES.member.reportsNew
      ) {
        return true;
      }

      return (
        pathname.startsWith(`${ROUTES.member.reports}/`) &&
        pathname !== ROUTES.member.reportsNew
      );
    },
  },
  {
    label: "Report History",
    to: ROUTES.member.reportsHistory,
    icon: History,
    isActiveMatch: (pathname) =>
      pathname === ROUTES.member.reportsHistory ||
      isMemberReportVersionsPath(pathname),
  },
];

export const MANAGER_NAV_ITEMS: AppNavItemConfig[] = [
  {
    label: "Dashboard",
    to: ROUTES.manager.dashboard,
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Reports",
    to: ROUTES.manager.reports,
    icon: ClipboardList,
    isActiveMatch: (pathname) =>
      pathname === ROUTES.manager.reports ||
      isManagerReportDetailPath(pathname),
  },
  {
    label: "Review",
    to: ROUTES.manager.review,
    icon: ListChecks,
    end: true,
  },
  {
    label: "Users",
    to: ROUTES.manager.users,
    icon: Users,
    isActiveMatch: (pathname) =>
      pathname === ROUTES.manager.users ||
      isManagerUserDetailPath(pathname),
  },
  {
    label: "Projects",
    to: ROUTES.manager.projects,
    icon: FolderKanban,
    end: true,
  },
  {
    label: "Task Types",
    to: ROUTES.manager.taskTypes,
    icon: Tags,
    end: true,
  },
];
