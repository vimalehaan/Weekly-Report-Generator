import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/routes/paths";
import { cn } from "@/lib/utils";

export function MemberDashboardQuickActions() {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">Quick actions</h2>
      <div className="flex flex-wrap gap-2">
        <Link
          to={ROUTES.member.reportsNew}
          className={cn(buttonVariants({ size: "sm" }), "inline-flex gap-1.5")}
        >
          <Plus className="size-4" aria-hidden />
          New Report
        </Link>
        <Link
          to={ROUTES.member.reports}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          My Reports
        </Link>
        <Link
          to={ROUTES.member.reportsHistory}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          Report History
        </Link>
      </div>
    </section>
  );
}
