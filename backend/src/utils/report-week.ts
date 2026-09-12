/** Reporting weeks use UTC calendar dates: Monday start through Sunday end. */

export function getUtcDayOfWeek(isoDate: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return null;
  }

  return new Date(`${isoDate}T00:00:00.000Z`).getUTCDay();
}

export function isMondayWeekStart(isoDate: string): boolean {
  return getUtcDayOfWeek(isoDate) === 1;
}

export function isSundayWeekEnd(isoDate: string): boolean {
  return getUtcDayOfWeek(isoDate) === 0;
}

export function computeWeekEndFromWeekStart(weekStartDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(weekStartDate);

  if (!match) {
    return "";
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const start = new Date(Date.UTC(year, month - 1, day));
  start.setUTCDate(start.getUTCDate() + 6);

  return start.toISOString().slice(0, 10);
}

export function isValidReportingWeekWindow(
  weekStartDate: string,
  weekEndDate: string,
): boolean {
  if (!isMondayWeekStart(weekStartDate) || !isSundayWeekEnd(weekEndDate)) {
    return false;
  }

  return weekEndDate === computeWeekEndFromWeekStart(weekStartDate);
}
