import { Link, useLocation, useParams } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/routes/paths";
import { cn } from "@/lib/utils";

export function MemberReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const location = useLocation();
  const draftCreated = Boolean(
    (location.state as { draftCreated?: boolean } | null)?.draftCreated,
  );

  return (
    <section className="space-y-4">
      {draftCreated ? (
        <p
          className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-900 dark:text-emerald-100"
          role="status"
        >
          Draft saved successfully. Full report details will be available in a
          later milestone.
        </p>
      ) : null}

      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Report details</h1>
        <p className="text-sm text-muted-foreground">
          Full report view will be implemented in a later milestone.
        </p>
      </div>

      {reportId ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Report ID: <span className="font-mono text-foreground">{reportId}</span>
        </p>
      ) : null}

      <Link
        to={ROUTES.member.reports}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        Back to My Reports
      </Link>
    </section>
  );
}
