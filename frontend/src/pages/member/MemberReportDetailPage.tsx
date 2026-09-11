import { Link, useParams } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/routes/paths";
import { cn } from "@/lib/utils";

export function MemberReportDetailPage() {
  const { reportId } = useParams<{ reportId: string }>();

  return (
    <section className="space-y-4">
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
