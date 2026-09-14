import { FormField, formInputClassName } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import type { ActiveStatusFilterValues } from "@/utils/active-status-filter";

type TaskTypeListFiltersProps = {
  values: ActiveStatusFilterValues;
  disabled?: boolean;
  onChange: (values: ActiveStatusFilterValues) => void;
};

const EMPTY_FILTERS: ActiveStatusFilterValues = {
  activeStatus: "all",
};

export function TaskTypeListFilters({
  values,
  disabled = false,
  onChange,
}: TaskTypeListFiltersProps) {
  const hasActiveFilters = values.activeStatus !== "all";

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-medium text-foreground">Filter task types</h2>
        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 self-start sm:self-auto"
            disabled={disabled}
            onClick={() => onChange(EMPTY_FILTERS)}
          >
            Clear filters
          </Button>
        ) : null}
      </div>

      <FormField id="task-type-filter-status" label="Task type status">
        <select
          id="task-type-filter-status"
          className={formInputClassName(false)}
          disabled={disabled}
          value={values.activeStatus}
          onChange={(event) =>
            onChange({
              activeStatus: event.target
                .value as ActiveStatusFilterValues["activeStatus"],
            })
          }
        >
          <option value="all">All task types</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
      </FormField>
    </div>
  );
}
