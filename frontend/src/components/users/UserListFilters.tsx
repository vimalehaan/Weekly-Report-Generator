import { FormField, formInputClassName } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { ROLE_NAMES, type RoleName } from "@/types/auth";
import { formatRoleLabel } from "@/utils/user-display";

export type UserListFilterValues = {
  role: RoleName | "";
  activeStatus: "all" | "active" | "inactive";
};

type UserListFiltersProps = {
  values: UserListFilterValues;
  disabled?: boolean;
  onChange: (values: UserListFilterValues) => void;
};

const EMPTY_FILTERS: UserListFilterValues = {
  role: "",
  activeStatus: "all",
};

export function UserListFilters({
  values,
  disabled = false,
  onChange,
}: UserListFiltersProps) {
  const hasActiveFilters =
    values.role !== "" || values.activeStatus !== "all";

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-medium text-foreground">Filter users</h2>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="user-filter-role" label="Role">
          <select
            id="user-filter-role"
            className={formInputClassName(false)}
            disabled={disabled}
            value={values.role}
            onChange={(event) =>
              onChange({
                ...values,
                role: event.target.value as RoleName | "",
              })
            }
          >
            <option value="">All roles</option>
            {ROLE_NAMES.map((role) => (
              <option key={role} value={role}>
                {formatRoleLabel(role)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="user-filter-status" label="Account status">
          <select
            id="user-filter-status"
            className={formInputClassName(false)}
            disabled={disabled}
            value={values.activeStatus}
            onChange={(event) =>
              onChange({
                ...values,
                activeStatus: event.target.value as UserListFilterValues["activeStatus"],
              })
            }
          >
            <option value="all">All statuses</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </FormField>
      </div>
    </div>
  );
}

export function userListFiltersToApi(values: UserListFilterValues): {
  role?: RoleName;
  isActive?: boolean;
} {
  return {
    ...(values.role ? { role: values.role } : {}),
    ...(values.activeStatus === "active"
      ? { isActive: true }
      : values.activeStatus === "inactive"
        ? { isActive: false }
        : {}),
  };
}
