import type { DashboardSummary } from "@/types/dashboard";

type DashboardSummaryCardsProps = {
  summary: DashboardSummary;
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

export function DashboardSummaryCards({
  summary,
}: DashboardSummaryCardsProps) {
  const complianceValue = `${summary.compliance}%`;

  const complianceHint = summary.complianceCalculation
    ? `${summary.complianceCalculation.completedReports} of ${summary.complianceCalculation.expectedTeamMembers} active team members submitted or approved`
    : undefined;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="Submitted or approved reports"
        value={String(summary.totalSubmitted)}
        hint="Reports in submitted or approved status for the selected week."
      />
      <SummaryCard
        label="Submission compliance"
        value={complianceValue}
        hint={complianceHint}
      />
      <SummaryCard
        label="Needs correction"
        value={String(summary.needsCorrection)}
      />
      <SummaryCard
        label="Open blockers"
        value={String(summary.openBlockers)}
        hint="Blockers recorded on reports in the selected period."
      />
    </div>
  );
}
