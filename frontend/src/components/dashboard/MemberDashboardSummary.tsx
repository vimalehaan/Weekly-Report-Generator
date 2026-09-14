import type { MemberDashboardSummaryMetrics } from "@/utils/member-dashboard";

type MemberDashboardSummaryProps = {
  metrics: MemberDashboardSummaryMetrics;
};

type SummaryCardProps = {
  label: string;
  value: string;
  hint?: string;
};

function SummaryCard({ label, value, hint }: SummaryCardProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </article>
  );
}

export function MemberDashboardSummary({ metrics }: MemberDashboardSummaryProps) {
  const scopeHint = metrics.isPartialDataset
    ? `Based on your ${metrics.totalReports} most recent reports by week (showing latest page only).`
    : metrics.totalReports === 0
      ? undefined
      : `Across all ${metrics.totalReports} of your weekly reports.`;

  if (metrics.totalReports === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Reports submitted"
          value={String(metrics.submittedCount)}
          hint="Excludes drafts still in progress."
        />
        <SummaryCard
          label="Reports approved"
          value={String(metrics.approvedCount)}
        />
        <SummaryCard
          label="Needs correction"
          value={String(metrics.needsCorrectionCount)}
        />
        <SummaryCard
          label="Blockers logged"
          value={String(metrics.openBlockersCount)}
          hint="Total blocker entries on included reports."
        />
      </div>
      {scopeHint ? (
        <p className="text-xs text-muted-foreground">{scopeHint}</p>
      ) : null}
    </div>
  );
}
