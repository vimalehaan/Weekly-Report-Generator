import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DashboardChartCard,
  DashboardChartEmptyState,
} from "@/components/dashboard/DashboardChartCard";
import type { DashboardMemberStatusRow } from "@/types/dashboard";
import { REPORT_STATUS_CHART_COLORS } from "@/utils/dashboard-chart-colors";
import { truncateChartLabel } from "@/utils/chart-display";

type StatusByMemberChartProps = {
  data: DashboardMemberStatusRow[];
};

type MemberChartRow = DashboardMemberStatusRow & { shortName: string };

type MemberTooltipProps = {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: MemberChartRow;
  }>;
};

function MemberTooltip({ active, payload }: MemberTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const memberName = payload[0].payload.userName;

  return (
    <div className="max-w-xs rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{memberName}</p>
      <ul className="mt-1 space-y-0.5">
        {payload.map((entry) => (
          <li key={entry.name} className="flex justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span className="font-medium text-foreground">{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function hasAnyReportCounts(row: DashboardMemberStatusRow): boolean {
  return (
    row.DRAFT +
      row.SUBMITTED +
      row.NEEDS_CORRECTION +
      row.APPROVED >
    0
  );
}

export function StatusByMemberChart({ data }: StatusByMemberChartProps) {
  const chartData = data.map((row) => ({
    ...row,
    shortName: truncateChartLabel(row.userName, 18),
  }));

  const hasData = data.some(hasAnyReportCounts);

  return (
    <DashboardChartCard
      title="Report status by member"
      description="Stacked counts of report statuses per active team member."
    >
      {!hasData ? (
        <DashboardChartEmptyState message="No member report statuses for this period." />
      ) : (
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                height={56}
                interval={0}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip content={<MemberTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="DRAFT"
                name="Draft"
                stackId="status"
                fill={REPORT_STATUS_CHART_COLORS.DRAFT}
              />
              <Bar
                dataKey="SUBMITTED"
                name="Submitted"
                stackId="status"
                fill={REPORT_STATUS_CHART_COLORS.SUBMITTED}
              />
              <Bar
                dataKey="NEEDS_CORRECTION"
                name="Needs correction"
                stackId="status"
                fill={REPORT_STATUS_CHART_COLORS.NEEDS_CORRECTION}
              />
              <Bar
                dataKey="APPROVED"
                name="Approved"
                stackId="status"
                fill={REPORT_STATUS_CHART_COLORS.APPROVED}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardChartCard>
  );
}
