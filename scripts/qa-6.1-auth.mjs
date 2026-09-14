/**
 * Milestone 6.1 — Auth & RBAC browser QA (Playwright).
 * Run: npx playwright install chromium && node scripts/qa-6.1-auth.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.QA_FRONTEND_URL ?? "http://localhost:5173";
const MEMBER = {
  email: "alex.jordan@example.com",
  password: "Password123!",
};
const MANAGER = {
  email: "sarah.chen@example.com",
  password: "Password123!",
};

const MEMBER_PROTECTED = [
  "/member/dashboard",
  "/member/reports",
  "/member/reports/new",
  "/member/reports/history",
];

const MANAGER_PROTECTED = [
  "/manager/dashboard",
  "/manager/reports",
  "/manager/users",
  "/manager/projects",
  "/manager/task-types",
];

const results = [];

function record(name, pass, notes) {
  results.push({ name, pass, notes });
}

async function getRouterState(page) {
  return page.evaluate(() => {
    const state = window.history.state;
    return state?.usr ?? state ?? null;
  });
}

async function waitForPath(page, pattern, timeout = 15000) {
  await page.waitForURL(pattern, { timeout });
}

async function loginViaForm(page, { email, password }, options = {}) {
  const { clearReturnTo = false } = options;
  await page.goto(`${BASE}/login`);
  if (clearReturnTo) {
    await page.evaluate(() => {
      window.history.replaceState({ usr: {} }, "", "/login");
    });
  }
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.getByRole("button", { name: /sign in/i }).click();
}

async function logoutViaHeader(page) {
  await Promise.all([
    page.waitForURL(/\/login(?:\?.*)?$/, { timeout: 15000 }),
    page.getByRole("button", { name: /sign out/i }).click(),
  ]);
  await page.waitForTimeout(300);
}

async function resetUnauthenticated(context, page) {
  await context.clearCookies();
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    window.history.replaceState({ usr: {} }, "", "/login");
  });
}

async function headerShowsName(page, name) {
  return page.locator("header").getByText(name).isVisible();
}

async function headerShowsRole(page, roleLabel) {
  return page.locator("header").getByText(roleLabel, { exact: true }).isVisible();
}

async function mainNavLinkVisible(page, label) {
  const link = page
    .getByRole("navigation", { name: "Main" })
    .getByRole("link", { name: label });
  try {
    await link.waitFor({ state: "visible", timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();

  try {
    // Test 1 — Unauthenticated protected routes
    let t1Fail = [];
    for (const route of [...MEMBER_PROTECTED, ...MANAGER_PROTECTED]) {
      await context.clearCookies();
      await page.goto(`${BASE}${route}`);
      try {
        await waitForPath(page, /\/login$/);
      } catch {
        t1Fail.push(`${route} did not redirect to login (url: ${page.url()})`);
        continue;
      }
      const state = await getRouterState(page);
      const from = state?.usr?.from ?? state?.from;
      if (from !== route) {
        t1Fail.push(`${route}: expected state.from=${route}, got ${JSON.stringify(state)}`);
      }
    }
    record(
      "Unauthenticated member routes",
      t1Fail.filter((n) => MEMBER_PROTECTED.some((r) => n.startsWith(r))).length === 0,
      t1Fail.filter((n) => MEMBER_PROTECTED.some((r) => n.startsWith(r))).join("; ") || "All member URLs → /login with state.from",
    );
    record(
      "Unauthenticated manager routes",
      t1Fail.filter((n) => MANAGER_PROTECTED.some((r) => n.startsWith(r))).length === 0,
      t1Fail.filter((n) => MANAGER_PROTECTED.some((r) => n.startsWith(r))).join("; ") || "All manager URLs → /login with state.from",
    );

    // Test 2 — Team member
    await resetUnauthenticated(context, page);
    await loginViaForm(page, MEMBER);
    await waitForPath(page, /\/member\/dashboard$/);
    const memberDashOk = page.url().includes("/member/dashboard");
    const memberNav = await mainNavLinkVisible(page, "My Reports");
    const memberHeader = await headerShowsName(page, "Alex Jordan");
    const memberRole = await headerShowsRole(page, "Team Member");
    await page.reload();
    await page.waitForTimeout(500);
    const memberStillIn = page.url().includes("/member/dashboard");
    await page.goto(`${BASE}/login`);
    await waitForPath(page, /\/member\/dashboard$/);
    await page.goto(`${BASE}/register`);
    await waitForPath(page, /\/member\/dashboard$/);
    await logoutViaHeader(page);
    await page.goto(`${BASE}/member/reports`);
    await waitForPath(page, /\/login$/);
    record(
      "Team member login/session",
      memberDashOk && memberNav && memberHeader && memberRole && memberStillIn,
      `dash=${memberDashOk} nav=${memberNav} header=${memberHeader} role=${memberRole} refresh=${memberStillIn}`,
    );

    // Test 4 — Member → manager routes
    await resetUnauthenticated(context, page);
    await loginViaForm(page, MEMBER, { clearReturnTo: true });
    await waitForPath(page, /\/member\/dashboard$/);
    let t4Fail = [];
    for (const route of MANAGER_PROTECTED) {
      await page.goto(`${BASE}${route}`);
      await page.waitForTimeout(300);
      if (!page.url().includes("/member/dashboard")) {
        t4Fail.push(`${route} → ${page.url()}`);
        continue;
      }
      const forbidden = await page
        .getByText(/do not have permission to access that page/i)
        .isVisible()
        .catch(() => false);
      if (!forbidden) {
        t4Fail.push(`${route}: forbidden notice missing`);
      }
    }
    record(
      "Team member → manager routes",
      t4Fail.length === 0,
      t4Fail.join("; ") || "Redirect to member dashboard + forbidden notice",
    );

    // Test 3 — Manager
    await resetUnauthenticated(context, page);
    await loginViaForm(page, MANAGER, { clearReturnTo: true });
    await waitForPath(page, /\/manager\/dashboard$/);
    const mgrDashOk = page.url().includes("/manager/dashboard");
    const mgrNav = await mainNavLinkVisible(page, "Reports");
    const mgrHeader = await headerShowsName(page, "Sarah Chen");
    const mgrRole = await headerShowsRole(page, "Manager");
    await page.reload();
    await page.waitForTimeout(500);
    const mgrStillIn = page.url().includes("/manager/dashboard");
    await page.goto(`${BASE}/login`);
    await waitForPath(page, /\/manager\/dashboard$/);
    await logoutViaHeader(page);
    await page.goto(`${BASE}/manager/users`);
    await waitForPath(page, /\/login$/);
    record(
      "Manager login/session",
      mgrDashOk && mgrNav && mgrHeader && mgrRole && mgrStillIn,
      `dash=${mgrDashOk} nav=${mgrNav} header=${mgrHeader} role=${mgrRole} refresh=${mgrStillIn}`,
    );

    // Test 5 — Manager → member routes
    await resetUnauthenticated(context, page);
    await loginViaForm(page, MANAGER, { clearReturnTo: true });
    await waitForPath(page, /\/manager\/dashboard$/);
    let t5Fail = [];
    for (const route of MEMBER_PROTECTED) {
      await page.goto(`${BASE}${route}`);
      await page.waitForTimeout(300);
      if (!page.url().includes("/manager/dashboard")) {
        t5Fail.push(`${route} → ${page.url()}`);
        continue;
      }
      const forbidden = await page
        .getByText(/do not have permission to access that page/i)
        .isVisible()
        .catch(() => false);
      if (!forbidden) {
        t5Fail.push(`${route}: forbidden notice missing`);
      }
    }
    record(
      "Manager → member routes",
      t5Fail.length === 0,
      t5Fail.join("; ") || "Redirect to manager dashboard + forbidden notice",
    );

    // Test 6 — Direct URL (covered above via goto)
    record("Direct URL protection", t1Fail.length === 0 && t4Fail.length === 0 && t5Fail.length === 0, "Address-bar navigation used in tests 1,4,5");

    // Test 7 — Session lifecycle
    await resetUnauthenticated(context, page);
    await loginViaForm(page, MEMBER);
    await waitForPath(page, /\/member\/dashboard$/);
    await page.reload();
    await page.goto(`${BASE}/member/reports`);
    await waitForPath(page, /\/member\/reports$/);
    await logoutViaHeader(page);
    await page.goto(`${BASE}/member/reports`);
    await waitForPath(page, /\/login$/);
    await loginViaForm(page, MEMBER);
    await waitForPath(page, /\/member\/reports$/);
    const lifecycleOk =
      page.url().includes("/member/reports") &&
      (await headerShowsName(page, "Alex Jordan"));
    record(
      "Logout/session clearing",
      lifecycleOk,
      lifecycleOk
        ? "Login → refresh → navigate → logout → block → re-login restores session (return URL preserved)"
        : `Final url: ${page.url()}`,
    );
  } finally {
    await browser.close();
  }

  console.log("\n## 6.1 Test Results\n");
  console.log("| Test | Result | Notes |");
  console.log("|---|---|---|");
  for (const r of results) {
    console.log(`| ${r.name} | ${r.pass ? "PASS" : "FAIL"} | ${r.notes.replace(/\|/g, "\\|")} |`);
  }
  const failed = results.filter((r) => !r.pass);
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
