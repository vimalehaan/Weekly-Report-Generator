import { FormField, formInputClassName } from "@/components/common/FormField";
import { WeekWindowDatePicker } from "@/components/common/WeekWindowDatePicker";
import { Button } from "@/components/ui/button";
import {
  formatIsoWeekWindow,
  isMondayWeekStart,
} from "@/utils/report-dates";
import { REPORT_STATUSES, type ReportStatus } from "@/types/report";
import type { User } from "@/types/auth";
import { formatUserDisplayName } from "@/utils/user-display";

export type ManagerReportFilterValues = {
  status: ReportStatus | "";
  weekStartDate: string;
  userId: string;
};

type ManagerReportFiltersProps = {
  values: ManagerReportFilterValues;
  teamMembers: User[];
  membersLoadError: string | null;
  disabled?: boolean;
  onChange: (values: ManagerReportFilterValues) => void;
  onRetryMembers?: () => void;
};

const STATUS_FILTER_LABELS: Record<ReportStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  NEEDS_CORRECTION: "Needs correction",
  APPROVED: "Approved",
};

export function ManagerReportFilters({
  values,
  teamMembers,
  membersLoadError,
  disabled = false,
  onChange,
  onRetryMembers,
}: ManagerReportFiltersProps) {
  const hasActiveFilters =
    values.status !== "" ||
    values.weekStartDate !== "" ||
    values.userId !== "";

  function patch(partial: Partial<ManagerReportFilterValues>) {
    onChange({ ...values, ...partial });
  }

  function clearFilters() {
    onChange({
      status: "",
      weekStartDate: "",
      userId: "",
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-medium text-foreground">Filter reports</h2>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 self-start sm:self-auto"
            disabled={disabled}
            onClick={clearFilters}
          >
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormField id="manager-filter-status" label="Status">
          <select
            id="manager-filter-status"
            className={formInputClassName(false)}
            disabled={disabled}
            value={values.status}
            onChange={(event) =>
              patch({
                status: event.target.value as ReportStatus | "",
              })
            }
          >
            <option value="">All statuses</option>
            {REPORT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_FILTER_LABELS[status]}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="manager-filter-week" label="Reporting week">
          <WeekWindowDatePicker
            id="manager-filter-week"
            value={values.weekStartDate}
            disabled={disabled}
            invalid={
              values.weekStartDate !== "" &&
              !isMondayWeekStart(values.weekStartDate)
            }
            onChange={(weekStartDate) => patch({ weekStartDate })}
          />
          {values.weekStartDate && isMondayWeekStart(values.weekStartDate) ? (
            <p className="mt-2 text-xs text-muted-foreground tabular-nums">
              Week window: {formatIsoWeekWindow(values.weekStartDate)}
            </p>
          ) : values.weekStartDate ? (
            <p className="mt-2 text-xs text-destructive">
              Week filter uses Monday week starts (YYYY-MM-DD).
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Optional: pick a Monday to filter by reporting week (Mon–Sun).
            </p>
          )}
        </FormField>

        <FormField id="manager-filter-member" label="Team member">
          <select
            id="manager-filter-member"
            className={formInputClassName(false)}
            disabled={disabled || Boolean(membersLoadError)}
            value={values.userId}
            onChange={(event) => patch({ userId: event.target.value })}
          >
            <option value="">All team members</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {formatUserDisplayName(member)}
              </option>
            ))}
          </select>
          {membersLoadError ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <p className="text-xs text-destructive">{membersLoadError}</p>
              {onRetryMembers ? (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={onRetryMembers}
                >
                  Retry
                </Button>
              ) : null}
            </div>
          ) : null}
        </FormField>
      </div>
    </div>
  );
}
