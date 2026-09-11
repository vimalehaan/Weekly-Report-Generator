import { FormField, formInputClassName } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";

type DashboardWeekFilterProps = {
  weekStartDate: string;
  disabled?: boolean;
  onWeekStartDateChange: (value: string) => void;
  onClear: () => void;
};

export function DashboardWeekFilter({
  weekStartDate,
  disabled = false,
  onWeekStartDateChange,
  onClear,
}: DashboardWeekFilterProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-xs flex-1">
        <FormField
          id="dashboard-week-start"
          label="Week start date"
        >
          <input
            id="dashboard-week-start"
            type="date"
            className={formInputClassName(false)}
            value={weekStartDate}
            disabled={disabled}
            onChange={(event) => onWeekStartDateChange(event.target.value)}
          />
        </FormField>
        <p className="mt-2 text-xs text-muted-foreground">
          Leave empty to use the latest eight reporting weeks. Select a week
          start to focus all metrics on that week (must match report week start
          dates).
        </p>
      </div>
      {weekStartDate ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={onClear}
        >
          Clear week filter
        </Button>
      ) : null}
    </div>
  );
}
