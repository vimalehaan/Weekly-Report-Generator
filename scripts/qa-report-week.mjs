/** Shared reporting-week helpers for Playwright QA scripts (UTC Monday starts). */

export function formatUtcDate(date) {
  return date.toISOString().slice(0, 10);
}

/** Normalizes a UTC calendar date to the Monday that starts its reporting week. */
export function toMondayWeekStartUtc(date) {
  const normalized = new Date(date);
  normalized.setUTCHours(0, 0, 0, 0);
  const day = normalized.getUTCDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  normalized.setUTCDate(normalized.getUTCDate() - daysFromMonday);
  return normalized;
}

export function isMondayUtc(isoDate) {
  const day = new Date(`${isoDate}T00:00:00.000Z`).getUTCDay();
  return day === 1;
}

/**
 * Finds an unused Monday week start for the authenticated member (via page.request cookies).
 */
export async function pickAvailableWeek(page, apiBaseUrl, options = {}) {
  const { anchorIso = "2026-09-07T00:00:00.000Z", maxWeeks = 104 } = options;

  const res = await page.request.get(`${apiBaseUrl}/api/v1/reports?limit=100`);
  if (!res.ok()) {
    throw new Error(`Failed to list reports for week pick: ${res.status()}`);
  }

  const json = await res.json();
  const used = new Set(
    (json.data ?? []).map((report) =>
      formatUtcDate(new Date(report.weekStartDate)),
    ),
  );

  let cursor = toMondayWeekStartUtc(new Date(anchorIso));

  for (let i = 0; i < maxWeeks; i += 1) {
    const weekStartDate = formatUtcDate(cursor);
    if (!used.has(weekStartDate) && isMondayUtc(weekStartDate)) {
      const end = new Date(cursor);
      end.setUTCDate(end.getUTCDate() + 6);
      return { weekStartDate, weekEndDate: formatUtcDate(end) };
    }
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }

  throw new Error("Could not find an unused Monday reporting week");
}

export async function waitForReportCatalogReady(page) {
  await page
    .getByText("Loading projects and task types…")
    .waitFor({ state: "hidden", timeout: 20000 })
    .catch(() => {});
}

/**
 * Paginates My Reports until the report card for reportId is visible (10 per page).
 */
export async function waitForMemberReportCard(page, reportId, options = {}) {
  const { listHeading = "My Reports", loadingText = "Loading reports…" } =
    options;

  await page.getByRole("heading", { name: listHeading }).waitFor({
    state: "visible",
    timeout: 15000,
  });
  await page
    .getByText(loadingText)
    .waitFor({ state: "hidden", timeout: 20000 })
    .catch(() => {});

  const card = page.getByRole("article").filter({
    has: page.locator(`a[href*="/member/reports/${reportId}"]`),
  });

  const paginationNav = page.getByRole("navigation", {
    name: "Report list pagination",
  });

  for (let pageIndex = 0; pageIndex < 15; pageIndex += 1) {
    try {
      await card.first().waitFor({ state: "visible", timeout: 3000 });
      return card.first();
    } catch {
      const next = paginationNav.getByRole("button", { name: "Next" });
      if (!(await next.isVisible().catch(() => false))) {
        break;
      }
      if (await next.isDisabled()) {
        break;
      }
      await next.click();
      await page
        .getByText(loadingText)
        .waitFor({ state: "hidden", timeout: 20000 })
        .catch(() => {});
    }
  }

  throw new Error(`Report ${reportId} not found in paginated list`);
}
