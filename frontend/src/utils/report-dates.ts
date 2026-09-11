const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatReportWeekRange(
  weekStartDate: string,
  weekEndDate: string,
): string {
  const start = dateFormatter.format(new Date(weekStartDate));
  const end = dateFormatter.format(new Date(weekEndDate));

  return `${start} – ${end}`;
}

export function formatReportTimestamp(isoDate: string): string {
  return dateTimeFormatter.format(new Date(isoDate));
}
