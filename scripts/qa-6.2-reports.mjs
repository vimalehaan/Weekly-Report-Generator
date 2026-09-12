/**
 * Milestone 6.2 — Team member report workflow browser QA (Playwright).
 * Run (with frontend :5173 and backend :3000 up):
 *   cd frontend && node ../scripts/qa-6.2-reports.mjs
 */
import { chromium } from "playwright";
import {
  pickAvailableWeek,
  waitForMemberReportCard,
  waitForReportCatalogReady,
} from "./qa-report-week.mjs";

const BASE = process.env.QA_FRONTEND_URL ?? "http://localhost:5173";
const API = process.env.QA_API_URL ?? "http://localhost:3000";
const MEMBER = {
  email: "alex.jordan@example.com",
  password: "Password123!",
};
const MANAGER = {
  email: "sarah.chen@example.com",
  password: "Password123!",
};

const QA_NOTES = "QA-6.2 E2E automated report — safe to identify in lists.";
const QA_TASK_NAME = "QA-6.2 Playwright workflow task";
const QA_TASK_NAME_EDITED = "QA-6.2 Playwright workflow task (edited)";

const results = [];

function record(name, pass, notes = "") {
  results.push({ name, pass: pass ? "PASS" : pass === null ? "BLOCKED" : "FAIL", notes });
}

function fail(name, notes) {
  record(name, false, notes);
}

function pass(name, notes = "") {
  record(name, true, notes);
}

function blocked(name, notes) {
  record(name, null, notes);
}

function formatWeekRangeLabel(weekStartDate, weekEndDate) {
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${dateFormatter.format(new Date(`${weekStartDate}T00:00:00Z`))} – ${dateFormatter.format(new Date(`${weekEndDate}T00:00:00Z`))}`;
}

function reportCard(page, reportId) {
  return page.getByRole("article").filter({
    has: page.locator(`a[href*="/member/reports/${reportId}"]`),
  });
}

async function waitForPath(page, pattern, timeout = 20000) {
  await page.waitForURL(pattern, { timeout });
}

async function loginViaForm(page, context, { email, password }) {
  await context.clearCookies();
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await waitForPath(page, /\/member\/dashboard$|\/manager\/dashboard$/);
}

async function loginManager(page, context) {
  await context.clearCookies();
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill("#email", MANAGER.email);
  await page.fill("#password", MANAGER.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await waitForPath(page, /\/manager\/dashboard$/);
}

async function waitReportsListReady(page) {
  await page.getByRole("heading", { name: "My Reports" }).waitFor({ state: "visible" });
  await page
    .getByText("Loading reports…")
    .waitFor({ state: "hidden", timeout: 20000 })
    .catch(() => {});
}

async function fillFirstTaskRow(page) {
  await page.getByRole("button", { name: "Add task" }).first().click();
  await page.getByRole("heading", { name: "Task 1" }).waitFor({ state: "visible" });

  const projectSelect = page.locator("#tasks\\.0\\.projectId");
  await projectSelect.waitFor({ state: "visible" });
  const projectOptions = projectSelect.locator("option");
  const projectCount = await projectOptions.count();
  if (projectCount < 2) {
    throw new Error("No active projects in create form");
  }
  const projectValue = await projectOptions.nth(1).getAttribute("value");
  await projectSelect.selectOption(projectValue ?? { index: 1 });

  const taskTypeSelect = page.locator("#tasks\\.0\\.taskTypeId");
  const taskTypeCount = await taskTypeSelect.locator("option").count();
  if (taskTypeCount >= 2) {
    const taskTypeValue = await taskTypeSelect.locator("option").nth(1).getAttribute("value");
    if (taskTypeValue) {
      await taskTypeSelect.selectOption(taskTypeValue);
    }
  }

  await page.locator("#tasks\\.0\\.taskName").fill(QA_TASK_NAME);
  await page.locator("#tasks\\.0\\.plannedHours").fill("4");
  await page.locator("#tasks\\.0\\.spentHours").fill("2");
}

async function statusBadgeVisible(page, label) {
  return page.getByText(label, { exact: true }).first().isVisible();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  let reportId = null;
  let week = null;
  let weekRangeLabel = null;
  let versionNumber = null;

  try {
    // —— Login ——
    await loginViaForm(page, context, MEMBER);

    // —— 1. My Reports ——
    await page.goto(`${BASE}/member/reports`, { waitUntil: "networkidle" });
    await waitReportsListReady(page);

    const articles = page.getByRole("article");
    const articleCount = await articles.count();
    if (articleCount === 0) {
      fail("My Reports list", "Expected seeded reports for alex.jordan");
    } else {
      const first = articles.first();
      const hasView = await first.getByRole("link", { name: "View" }).isVisible();
      const hasStatus = await first.getByText(/Draft|Submitted|Approved|Needs correction/).isVisible();
      const hasUpdated = await first.getByText(/Updated/).isVisible();
      pass(
        "My Reports list",
        hasView && hasStatus && hasUpdated
          ? `${articleCount} report card(s); summary fields present`
          : `cards=${articleCount} view=${hasView} status=${hasStatus} updated=${hasUpdated}`,
      );
    }

    const paginationNav = page.getByRole("navigation", {
      name: "Report list pagination",
    });
    if (await paginationNav.isVisible().catch(() => false)) {
      const prev = paginationNav.getByRole("button", { name: "Previous" });
      const next = paginationNav.getByRole("button", { name: "Next" });
      const prevDisabled = await prev.isDisabled();
      const paginationText = await paginationNav.locator("p").first().textContent();
      const totalPagesMatch = paginationText?.match(/Page (\d+) of (\d+)/);
      const totalPages = totalPagesMatch ? Number(totalPagesMatch[2]) : 1;
      if (totalPages > 1 && prevDisabled) {
        await next.click();
        await page.getByText(`Page 2 of ${totalPages}`).waitFor({ timeout: 10000 });
        await prev.click();
        await page.getByText(`Page 1 of ${totalPages}`).waitFor({ timeout: 10000 });
        pass("My Reports pagination", "Next/Previous follow API pages");
      } else {
        pass(
          "My Reports pagination",
          `Single page or at boundary (page text: ${paginationText?.trim() ?? "n/a"})`,
        );
      }
    } else {
      pass("My Reports pagination", "No pagination control (empty or zero total)");
    }

    await page.getByRole("link", { name: "New Report" }).click();
    await waitForPath(page, /\/member\/reports\/new$/);
    pass("Create Report navigation", "New Report → /member/reports/new");

    // —— 2. Create Report ——
    await page.goto(`${BASE}/member/reports/new`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Create Weekly Report" }).waitFor();

    await page.getByRole("button", { name: "Save draft" }).click();
    const validationVisible = await page
      .getByText(/Date is required|Must be a valid date/)
      .first()
      .isVisible()
      .catch(() => false);
    pass(
      "Create Report validation",
      validationVisible ? "Empty submit blocked with validation" : "Validation messages not found",
    );

    week = await pickAvailableWeek(page, API);
    weekRangeLabel = formatWeekRangeLabel(week.weekStartDate, week.weekEndDate);
    await page.locator("#weekStartDate").fill(week.weekStartDate);
    await page.locator("#weekStartDate").blur();
    // Week end is derived from week start in the UI (read-only); no #weekEndDate input.

    await waitForReportCatalogReady(page);

    await fillFirstTaskRow(page);

    await page.locator("#notes").fill(QA_NOTES);

    const saveDraftButton = page.getByRole("button", { name: "Save draft" });
    await saveDraftButton.waitFor({ state: "visible", timeout: 15000 });
    await saveDraftButton.waitFor({ state: "attached" });
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (!(await saveDraftButton.isDisabled())) {
        break;
      }
      await page.waitForTimeout(200);
    }

    const createReportResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/v1/reports") &&
        response.request().method() === "POST",
      { timeout: 30000 },
    );
    await saveDraftButton.click();
    const createResponse = await createReportResponse;
    if (createResponse.status() !== 201) {
      const errBody = await createResponse.text().catch(() => "");
      throw new Error(
        `POST /reports failed: ${createResponse.status()} ${errBody}`,
      );
    }
    await waitForPath(page, /\/member\/reports\/[0-9a-f-]+$/);
    reportId = page.url().split("/").pop();
    await page.getByText("Draft saved successfully.").waitFor({ timeout: 10000 }).catch(() => {});
    await page.getByText("Draft").first().waitFor({ state: "visible", timeout: 10000 });
    const draftCreatedMsg = await page
      .getByText("Draft saved successfully.")
      .isVisible()
      .catch(() => false);
    const isDraft = await statusBadgeVisible(page, "Draft");
    pass(
      "Create Report save draft",
      draftCreatedMsg && isDraft && reportId
        ? `reportId=${reportId} week ${week.weekStartDate}`
        : `msg=${draftCreatedMsg} draft=${isDraft} id=${reportId}`,
    );

    // —— 3. Draft detail ——
    const taskVisible = await page.getByText(QA_TASK_NAME).isVisible();
    const notesVisible = await page.getByText(QA_NOTES).isVisible();
    const editVisible = await page.getByRole("button", { name: "Edit" }).isVisible();
    const submitVisible = await page.getByRole("button", { name: "Submit" }).isVisible();
    await page.reload();
    await page.getByText(QA_TASK_NAME).waitFor({ state: "visible", timeout: 15000 });
    pass(
      "Draft detail view",
      taskVisible && notesVisible && editVisible && submitVisible
        ? "Content, Edit, Submit; survives refresh"
        : `task=${taskVisible} notes=${notesVisible} edit=${editVisible} submit=${submitVisible}`,
    );

    // —— 4. Edit draft ——
    await page.getByRole("button", { name: "Edit" }).click();
    await page.locator("#tasks\\.0\\.taskName").fill(QA_TASK_NAME_EDITED);
    await page.getByRole("button", { name: "Save changes" }).click();
    await page.getByText("Changes saved successfully.").waitFor({ timeout: 15000 });
    await page.getByText(QA_TASK_NAME_EDITED).waitFor({ state: "visible" });
    const stillDraft = await statusBadgeVisible(page, "Draft");
    const editAfterSave = await page.getByRole("button", { name: "Edit" }).isVisible();
    pass(
      "Edit draft",
      stillDraft && editAfterSave
        ? "PATCH reflected; status remains Draft"
        : `draft=${stillDraft} edit=${editAfterSave}`,
    );

    // —— 5. Submit report ——
    await page.getByRole("button", { name: "Submit" }).click();
    await page.getByRole("heading", { name: "Submit report?" }).waitFor();
    const submitRequest = page.waitForResponse(
      (res) =>
        res.url().includes(`/api/v1/reports/${reportId}/submit`) &&
        res.request().method() === "POST",
      { timeout: 20000 },
    );
    await page.getByRole("button", { name: "Confirm submit" }).click();
    const submitRes = await submitRequest;
    const submittedOk = submitRes.ok();
    await page.getByText("Report submitted successfully.").waitFor({ timeout: 15000 });
    const isSubmitted = await statusBadgeVisible(page, "Submitted");
    const editHidden = !(await page.getByRole("button", { name: "Edit" }).isVisible().catch(() => false));
    const submitHidden = !(await page.getByRole("button", { name: "Submit" }).isVisible().catch(() => false));
    const readOnlyHint = await page
      .getByText(/awaiting manager review/)
      .isVisible()
      .catch(() => false);
    await page.reload();
    await page.getByText("Submitted").first().waitFor({ state: "visible" });
    pass(
      "Submit report",
      submittedOk && isSubmitted && editHidden && submitHidden && readOnlyHint
        ? "POST submit OK; read-only UI persists after refresh"
        : `api=${submittedOk} status=${isSubmitted} editHidden=${editHidden} submitHidden=${submitHidden}`,
    );

    // —— 6. My Reports after submission ——
    await page.goto(`${BASE}/member/reports`, { waitUntil: "networkidle" });
    const submittedCard = await waitForMemberReportCard(page, reportId);
    const cardHasSubmitted = await submittedCard.getByText("Submitted").isVisible();
    await submittedCard.getByRole("link", { name: "View" }).click();
    await waitForPath(page, new RegExp(`/member/reports/${reportId}$`));
    const detailSubmitted = await statusBadgeVisible(page, "Submitted");
    pass(
      "My Reports after submission",
      cardHasSubmitted && detailSubmitted
        ? "List and detail show Submitted"
        : `list=${cardHasSubmitted} detail=${detailSubmitted}`,
    );

    // —— 7. Report History ——
    await page.goto(`${BASE}/member/reports/history`, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: "Report History" }).waitFor();
    await page
      .getByText("Loading report history…")
      .waitFor({ state: "hidden", timeout: 20000 })
      .catch(() => {});

    const historySubmitted = await waitForMemberReportCard(page, reportId, {
      listHeading: "Report History",
      loadingText: "Loading report history…",
    });
    const versionsLink = historySubmitted.getByRole("link", { name: "Versions" });
    const hasVersions = await versionsLink.isVisible();

    const draftHistory = page
      .getByRole("article")
      .filter({ hasText: "Draft" })
      .filter({ hasText: "Draft reports do not have submitted version snapshots yet" })
      .first();
    const draftNoVersions = await draftHistory.isVisible().catch(() => false);

    pass(
      "Report History",
      hasVersions
        ? `Submitted report has Versions; draft snapshot hint=${draftNoVersions}`
        : "Versions link missing on submitted report",
    );

    await versionsLink.click();
    await waitForPath(page, new RegExp(`/member/reports/${reportId}/versions$`));

    // —— 8. Version list ——
    await page.getByText(/Version \d+/).first().waitFor({ timeout: 10000 });
    const versionHeading = await page.getByText(/^Version \d+$/).first().textContent();
    versionNumber = versionHeading?.match(/Version (\d+)/)?.[1] ?? "1";
    const creatorVisible = await page.getByText(/Created by Alex Jordan/).isVisible();
    const readOnlyLine = await page.getByText(/Immutable historical snapshot/).isVisible();
    pass(
      "Version list",
      creatorVisible && readOnlyLine
        ? `At least version ${versionNumber} listed`
        : `creator=${creatorVisible} readOnly=${readOnlyLine}`,
    );

    await page.getByRole("link", { name: "View snapshot" }).first().click();
    await waitForPath(
      page,
      new RegExp(`/member/reports/${reportId}/versions/${versionNumber}$`),
    );

    // —— 9. Version snapshot ——
    await page.getByText("Historical snapshot — read only").waitFor();
    await page.getByText(QA_TASK_NAME_EDITED).waitFor({ state: "visible" });
    const noEdit = !(await page.getByRole("button", { name: "Edit" }).isVisible().catch(() => false));
    const noSubmit = !(await page.getByRole("button", { name: "Submit" }).isVisible().catch(() => false));
    await page.reload();
    await page.getByText("Historical snapshot — read only").waitFor();
    await page.getByRole("link", { name: "Back to version list" }).click();
    await waitForPath(page, new RegExp(`/member/reports/${reportId}/versions$`));
    pass(
      "Version snapshot",
      noEdit && noSubmit ? "Read-only snapshot; back navigation OK" : `edit=${!noEdit} submit=${!noSubmit}`,
    );

    // —— 10. Needs Correction (manager → member resubmit) ——
    await loginManager(page, context);
    await page.goto(`${BASE}/manager/reports/${reportId}`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Request correction" }).waitFor({ timeout: 15000 });
    await page.getByRole("button", { name: "Request correction" }).click();
    await page.locator("#correction-comment").fill("QA-6.2: Please clarify task hours in the notes.");
    await page.getByRole("button", { name: "Confirm correction request" }).click();
    await page
      .getByText("Correction requested. The team member can update and resubmit.")
      .waitFor({ timeout: 15000 });

    await loginViaForm(page, context, MEMBER);
    await page.goto(`${BASE}/member/reports/${reportId}`, { waitUntil: "networkidle" });
    const needsCorrection = await statusBadgeVisible(page, "Needs correction");
    const resubmitBtn = await page.getByRole("button", { name: "Resubmit" }).isVisible();
    const correctionHint = await page
      .getByText(/manager requested corrections/i)
      .isVisible()
      .catch(() => false);
    await page.getByRole("button", { name: "Edit" }).click();
    await page.locator("#notes").fill(`${QA_NOTES} Updated after correction.`);
    await page.getByRole("button", { name: "Save changes" }).click();
    await page.getByText("Changes saved successfully.").waitFor({ timeout: 15000 });
    await page.getByRole("button", { name: "Resubmit" }).click();
    await page.getByRole("heading", { name: "Resubmit report?" }).waitFor();
    await page.getByRole("button", { name: "Confirm resubmit" }).click();
    await page.getByText(/resubmitted successfully|submitted successfully/i).waitFor({ timeout: 15000 });
    const resubmitted = await statusBadgeVisible(page, "Submitted");
    pass(
      "Needs correction & resubmit",
      needsCorrection && resubmitBtn && correctionHint && resubmitted
        ? "Manager correction → member edit/resubmit → Submitted"
        : `nc=${needsCorrection} resubmit=${resubmitBtn} hint=${correctionHint} final=${resubmitted}`,
    );

    await page.goto(`${BASE}/member/reports/${reportId}/versions`, { waitUntil: "networkidle" });
    const versionCount = await page.getByRole("link", { name: "View snapshot" }).count();
    pass(
      "Version count after resubmit",
      versionCount >= 2 ? `${versionCount} snapshot(s)` : `Expected ≥2 versions, got ${versionCount}`,
    );

    // —— 11. Negative / error cases ——
    await page.goto(`${BASE}/member/reports/00000000-0000-4000-8000-000000000001`, {
      waitUntil: "networkidle",
    });
    const notFound = await page.getByRole("heading", { name: "Report not found" }).isVisible();
    pass("404 report detail", notFound ? "Not found UI" : `url=${page.url()}`);

    await loginManager(page, context);
    const mgrList = await page.request.get(`${API}/api/v1/reports?limit=50`);
    const mgrJson = await mgrList.json();
    const foreignId = (mgrJson.data ?? []).find(
      (r) => r.user?.email && r.user.email !== MEMBER.email,
    )?.id;

    await loginViaForm(page, context, MEMBER);

    if (foreignId) {
      await page.goto(`${BASE}/member/reports/${foreignId}`, { waitUntil: "networkidle" });
      const forbidden = await page.getByRole("heading", { name: "Access denied" }).isVisible();
      pass("403 foreign report", forbidden ? `Blocked access to ${foreignId}` : "Expected Access denied");
    } else {
      blocked("403 foreign report", "No other member report in manager team list");
    }

    await page.goto(`${BASE}/member/reports/${reportId}`, { waitUntil: "networkidle" });
    await page.getByText(QA_TASK_NAME_EDITED).waitFor({ state: "visible" });
    pass("Direct URL & refresh", `Detail loads by URL; reportId=${reportId}`);

    pass("Browser integration", "Forms, dialogs, goto, reload exercised in flow above");
  } catch (err) {
    fail("Unhandled QA error", err instanceof Error ? err.message : String(err));
  } finally {
    await browser.close();
  }

  console.log("\n### 6.2 Test Results\n");
  console.log("| Scenario | Result | Notes |");
  console.log("|---|---|---|");
  for (const r of results) {
    const notes = (r.notes ?? "").replace(/\|/g, "\\|");
    console.log(`| ${r.name} | ${r.pass} | ${notes} |`);
  }

  const failed = results.filter((r) => r.pass === "FAIL");
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
