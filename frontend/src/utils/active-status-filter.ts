export type ActiveStatusFilter = "all" | "active" | "inactive";

export type ActiveStatusFilterValues = {
  activeStatus: ActiveStatusFilter;
};

export function activeStatusFilterToApi(
  activeStatus: ActiveStatusFilter,
): { isActive?: boolean } {
  if (activeStatus === "active") {
    return { isActive: true };
  }

  if (activeStatus === "inactive") {
    return { isActive: false };
  }

  return {};
}
