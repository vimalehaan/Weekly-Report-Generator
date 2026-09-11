import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DashboardChartCard,
  DashboardChartEmptyState,
} from "@/components/dashboard/DashboardChartCard";
import type { DashboardTaskTrendPoint } from "@/types/dashboard";
import { formatWeekAxisLabel } from "@/utils/chart-display";

type TaskTrendsChartProps = {
  data: DashboardTaskTrendPoint[];
};

type TrendTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: DashboardTaskTrendPoint }>;
};

function TrendTooltip({ active, payload }: TrendTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{point.weekStartDate}</p>
      <p className="text-muted-foreground">
        Total tasks: {point.totalTasks}
      </p>
    </div>
  );
}

export function TaskTrendsChart({ data }: TaskTrendsChartProps) {
  return (
    <DashboardChartCard
      title="Task trends"
      description="Total tasks logged per reporting week."
    >
      {data.length === 0 ? (
        <DashboardChartEmptyState message="No task trend data for this period." />
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="weekStartDate"
                tickFormatter={formatWeekAxisLabel}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<TrendTooltip />} />
              <Line
                type="monotone"
                dataKey="totalTasks"
                name="Tasks"
                stroke="hsl(221 83% 53%)"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardChartCard>
  );
}
