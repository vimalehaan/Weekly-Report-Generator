import { FormField } from "@/components/common/FormField";
import { WeekWindowDatePicker } from "@/components/common/WeekWindowDatePicker";
import { Button } from "@/components/ui/button";
import {
  computeWeekEndFromWeekStart,
  formatIsoWeekWindow,
  getCurrentReportingWeekStart,
  isMondayWeekStart,
} from "@/utils/report-dates";

type DashboardWeekFilterProps = {
  weekStartDate: string;
  disabled?: boolean;
  onWeekStartDateChange: (value: string) => void;
  onResetToCurrentWeek: () => void;
};

export function DashboardWeekFilter({
  weekStartDate,
  disabled = false,
  onWeekStartDateChange,
  onResetToCurrentWeek,
}: DashboardWeekFilterProps) {
  const currentWeekStart = getCurrentReportingWeekStart();
  const showReset =
    isMondayWeekStart(weekStartDate) && weekStartDate !== currentWeekStart;

  const weekEndDate = isMondayWeekStart(weekStartDate)
    ? computeWeekEndFromWeekStart(weekStartDate)
    : "";

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-sm flex-1 space-y-2">
        <FormField id="dashboard-week-start" label="Reporting week">
          <WeekWindowDatePicker
            id="dashboard-week-start"
            value={weekStartDate}
            disabled={disabled}
            invalid={weekStartDate !== "" && !isMondayWeekStart(weekStartDate)}
            onChange={onWeekStartDateChange}
          />
        </FormField>
        {weekEndDate ? (
          <p className="text-xs text-muted-foreground tabular-nums">
            Week window: {formatIsoWeekWindow(weekStartDate)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Choose a Monday to view metrics for that reporting week (Mon–Sun).
          </p>
        )}
      </div>
      {showReset ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={onResetToCurrentWeek}
        >
          Current reporting week
        </Button>
      ) : null}
    </div>
  );
}
