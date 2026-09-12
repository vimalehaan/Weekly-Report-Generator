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

/** Monday that starts the reporting week containing the given UTC calendar date. */
export function getMondayOfReportingWeek(isoDate: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = date.getUTCDay();
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  date.setUTCDate(date.getUTCDate() - daysFromMonday);

  return date.toISOString().slice(0, 10);
}

/** Monday starting the reporting week that contains today (UTC calendar date). */
export function getCurrentReportingWeekStart(): string {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayIso = today.toISOString().slice(0, 10);
  const monday = getMondayOfReportingWeek(todayIso);

  if (!monday) {
    return todayIso;
  }

  return monday;
}
