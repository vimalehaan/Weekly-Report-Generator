import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/routes/paths";
import { cn } from "@/lib/utils";

export function ManagerReviewPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Review reports</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Approval, correction requests, manager comments, and review history
          are handled on each team report&apos;s detail page. Open a report from
          the team list to review its contents and take action when the status is
          submitted.
        </p>
      </div>

      <Link
        to={ROUTES.manager.reports}
        className={cn(buttonVariants({ size: "sm" }))}
      >
        Browse team reports
      </Link>
    </section>
  );
}
