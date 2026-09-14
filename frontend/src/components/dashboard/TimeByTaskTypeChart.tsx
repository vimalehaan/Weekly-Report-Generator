import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  DashboardChartCard,
  DashboardChartEmptyState,
} from "@/components/dashboard/DashboardChartCard";
import type { DashboardTaskTypeTime } from "@/types/dashboard";
import { TASK_TYPE_CHART_COLORS } from "@/utils/dashboard-chart-colors";
import { formatHoursValue, truncateChartLabel } from "@/utils/chart-display";

type TimeByTaskTypeChartProps = {
  data: DashboardTaskTypeTime[];
};

type TaskTypeTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: DashboardTaskTypeTime & { shortName: string };
  }>;
};

function TaskTypeTooltip({ active, payload }: TaskTypeTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const row = payload[0].payload;

  return (
    <div className="max-w-xs rounded-md border border-border bg-card px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-foreground">{row.taskTypeName}</p>
      <p className="text-muted-foreground">
        Spent hours: {formatHoursValue(row.spentHours)}
      </p>
    </div>
  );
}

export function TimeByTaskTypeChart({ data }: TimeByTaskTypeChartProps) {
  const chartData = data
    .filter((row) => row.spentHours > 0)
    .map((row, index) => ({
      ...row,
      shortName: truncateChartLabel(row.taskTypeName, 20),
      fill: TASK_TYPE_CHART_COLORS[index % TASK_TYPE_CHART_COLORS.length],
    }));

  return (
    <DashboardChartCard
      title="Time by task type"
      description="Share of spent hours grouped by task type."
    >
      {chartData.length === 0 ? (
        <DashboardChartEmptyState message="No spent hours recorded for this period." />
      ) : (
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="spentHours"
                nameKey="shortName"
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={96}
                paddingAngle={2}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.taskTypeId ?? entry.taskTypeName} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<TaskTypeTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                formatter={(value, entry) => {
                  const payload = entry.payload as DashboardTaskTypeTime | undefined;
                  return payload?.taskTypeName ?? value;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardChartCard>
  );
}
