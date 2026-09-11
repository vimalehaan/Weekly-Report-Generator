export function truncateChartLabel(value: string, maxLength = 16): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

export function formatWeekAxisLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function formatHoursValue(hours: number): string {
  if (Number.isInteger(hours)) {
    return String(hours);
  }

  return hours.toFixed(1);
}
