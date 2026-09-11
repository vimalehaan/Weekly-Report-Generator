import { FormField, formInputClassName } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";

export type TaskTypeListFilterValues = {
  activeStatus: "all" | "active" | "inactive";
};

type TaskTypeListFiltersProps = {
  values: TaskTypeListFilterValues;
  disabled?: boolean;
  onChange: (values: TaskTypeListFilterValues) => void;
};

const EMPTY_FILTERS: TaskTypeListFilterValues = {
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
                .value as TaskTypeListFilterValues["activeStatus"],
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

export function taskTypeListFiltersToApi(values: TaskTypeListFilterValues): {
  isActive?: boolean;
} {
  if (values.activeStatus === "active") {
    return { isActive: true };
  }

  if (values.activeStatus === "inactive") {
    return { isActive: false };
  }

  return {};
}
