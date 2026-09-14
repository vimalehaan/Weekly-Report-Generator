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
import { DashboardHorizontalScrollChart } from "@/components/dashboard/DashboardHorizontalScrollChart";
import type { DashboardProjectWorkload } from "@/types/dashboard";
import { formatHoursValue, truncateChartLabel } from "@/utils/chart-display";

type WorkloadByProjectChartProps = {
  data: DashboardProjectWorkload[];
};

type WorkloadTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: DashboardProjectWorkload & { shortName: string };
    name: string;
    value: number;
    color: string;
  }>;
};

function WorkloadTooltip({ active, payload }: WorkloadTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload;

  return (
    <div className="max-w-xs rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{row.projectName}</p>
      <p className="text-muted-foreground">Tasks: {row.taskCount}</p>
      <p className="text-muted-foreground">
        Planned hours: {formatHoursValue(row.plannedHours)}
      </p>
      <p className="text-muted-foreground">
        Spent hours: {formatHoursValue(row.spentHours)}
      </p>
    </div>
  );
}

export function WorkloadByProjectChart({ data }: WorkloadByProjectChartProps) {
  const chartData = data.map((row) => ({
    ...row,
    shortName: truncateChartLabel(row.projectName, 14),
  }));

  return (
    <DashboardChartCard
      title="Workload by project"
      description="Task counts and hours aggregated by project."
    >
      {data.length === 0 ? (
        <DashboardChartEmptyState message="No project workload for this period." />
      ) : (
        <DashboardHorizontalScrollChart
          itemCount={chartData.length}
          minWidthPerItem={72}
          scrollAriaLabel="Workload by project chart"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 4, bottom: 48 }}
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
              <Tooltip content={<WorkloadTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                dataKey="taskCount"
                name="Tasks"
                maxBarSize={56}
                fill="hsl(221 83% 53%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </DashboardHorizontalScrollChart>
      )}
    </DashboardChartCard>
  );
}
