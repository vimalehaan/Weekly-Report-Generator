import { FormField, formInputClassName } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";

export type ProjectListFilterValues = {
  activeStatus: "all" | "active" | "inactive";
};

type ProjectListFiltersProps = {
  values: ProjectListFilterValues;
  disabled?: boolean;
  onChange: (values: ProjectListFilterValues) => void;
};

const EMPTY_FILTERS: ProjectListFilterValues = {
  activeStatus: "all",
};

export function ProjectListFilters({
  values,
  disabled = false,
  onChange,
}: ProjectListFiltersProps) {
  const hasActiveFilters = values.activeStatus !== "all";

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-medium text-foreground">Filter projects</h2>
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

      <FormField id="project-filter-status" label="Project status">
        <select
          id="project-filter-status"
          className={formInputClassName(false)}
          disabled={disabled}
          value={values.activeStatus}
          onChange={(event) =>
            onChange({
              activeStatus: event.target
                .value as ProjectListFilterValues["activeStatus"],
            })
          }
        >
          <option value="all">All projects</option>
          <option value="active">Active only</option>
          <option value="inactive">Inactive only</option>
        </select>
      </FormField>
    </div>
  );
}

export function projectListFiltersToApi(values: ProjectListFilterValues): {
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
