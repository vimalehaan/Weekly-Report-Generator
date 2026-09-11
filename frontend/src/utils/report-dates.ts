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

export function isIsoDateString(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isoDateFromUtcParts(
  year: number,
  month: number,
  day: number,
): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseIsoDateParts(
  iso: string,
): { year: number; month: number; day: number } | null {
  if (!isIsoDateString(iso)) {
    return null;
  }

  const [year, month, day] = iso.split("-").map(Number);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return null;
  }

  return { year, month, day };
}

/** Inclusive 7-day reporting week: end = start + 6 calendar days (UTC date parts). */
export function computeWeekEndFromWeekStart(weekStartDate: string): string {
  const parts = parseIsoDateParts(weekStartDate);

  if (!parts) {
    return "";
  }

  const start = new Date(
    Date.UTC(parts.year, parts.month - 1, parts.day),
  );
  start.setUTCDate(start.getUTCDate() + 6);

  return start.toISOString().slice(0, 10);
}

export function isDateInReportingWeek(
  dayIso: string,
  weekStartIso: string,
): boolean {
  if (!isIsoDateString(dayIso) || !isIsoDateString(weekStartIso)) {
    return false;
  }

  const weekEndIso = computeWeekEndFromWeekStart(weekStartIso);

  return dayIso >= weekStartIso && dayIso <= weekEndIso;
}

export function formatIsoWeekWindow(weekStartIso: string): string {
  if (!isIsoDateString(weekStartIso)) {
    return "";
  }

  const weekEndIso = computeWeekEndFromWeekStart(weekStartIso);

  return `${weekStartIso} – ${weekEndIso}`;
}

export type CalendarDayCell = {
  isoDate: string;
  inCurrentMonth: boolean;
};

export function getMonthCalendarGrid(
  year: number,
  month: number,
): CalendarDayCell[] {
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const leadingEmpty = firstOfMonth.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: CalendarDayCell[] = [];

  const prevMonthDate = new Date(Date.UTC(year, month - 1, 0));
  const prevMonthDays = prevMonthDate.getUTCDate();
  const prevMonth = prevMonthDate.getUTCMonth() + 1;
  const prevYear = prevMonthDate.getUTCFullYear();

  for (let i = leadingEmpty - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    cells.push({
      isoDate: isoDateFromUtcParts(prevYear, prevMonth, day),
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      isoDate: isoDateFromUtcParts(year, month, day),
      inCurrentMonth: true,
    });
  }

  let nextYear = year;
  let nextMonth = month + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({
      isoDate: isoDateFromUtcParts(nextYear, nextMonth, nextDay),
      inCurrentMonth: false,
    });
    nextDay += 1;
  }

  return cells;
}

export function formatReportDate(dateString: string): string {
  if (!dateString) {
    return "";
  }

  return dateFormatter.format(new Date(`${dateString}T00:00:00`));
}

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
