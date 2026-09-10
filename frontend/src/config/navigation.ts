import {
  ClipboardList,
  FolderKanban,
  History,
  LayoutDashboard,
  ListChecks,
  Tags,
  Users,
} from "lucide-react";
import { ROUTES } from "@/routes/paths";
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
    isActiveMatch: (pathname) =>
      pathname === ROUTES.member.reports ||
      pathname === ROUTES.member.reportsNew,
  },
  {
    label: "Report History",
    to: ROUTES.member.reportsHistory,
    icon: History,
    end: true,
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
    end: true,
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
