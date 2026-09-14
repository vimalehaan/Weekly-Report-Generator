import { RoleName } from "@prisma/client";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";
import { hashPassword } from "../../src/utils/password.js";
import { getCurrentReportingWeekStart } from "../../src/utils/report-week.js";

const app = createApp();
const TEST_EMAIL_PREFIX = "dashboard-test-";
const TEST_PASSWORD = "Password123!";

function uniqueEmail(): string {
  return `${TEST_EMAIL_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

async function ensureRoles(): Promise<void> {
  await Promise.all(
    [RoleName.TEAM_MEMBER, RoleName.MANAGER].map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );
}

async function getRoleId(roleName: RoleName): Promise<string> {
  const role = await prisma.role.findUniqueOrThrow({
    where: { name: roleName },
    select: { id: true },
  });

  return role.id;
}

async function registerTeamMemberAgent() {
  const agent = request.agent(app);
  const email = uniqueEmail();

  await agent.post("/api/v1/auth/register").send({
    firstName: "Dash",
    lastName: "Member",
    email,
    password: TEST_PASSWORD,
  });

  await agent.post("/api/v1/auth/login").send({
    email,
    password: TEST_PASSWORD,
  });

  return agent;
}

async function createManagerAgent() {
  const email = uniqueEmail();
  const roleId = await getRoleId(RoleName.MANAGER);

  await prisma.user.create({
    data: {
      firstName: "Dash",
      lastName: "Manager",
      email,
      passwordHash: await hashPassword(TEST_PASSWORD),
      roleId,
      isActive: true,
    },
  });

  const agent = request.agent(app);

  await agent.post("/api/v1/auth/login").send({
    email,
    password: TEST_PASSWORD,
  });

  return agent;
}

async function cleanupTestData(): Promise<void> {
  await prisma.user.deleteMany({
    where: { email: { startsWith: TEST_EMAIL_PREFIX } },
  });
}

beforeAll(async () => {
  await ensureRoles();
});

afterEach(async () => {
  await cleanupTestData();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("GET /api/v1/dashboard/summary", () => {
  it("returns 401 when unauthenticated", async () => {
    const response = await request(app).get("/api/v1/dashboard/summary");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 403 for a team member", async () => {
    const member = await registerTeamMemberAgent();

    const response = await member.get("/api/v1/dashboard/summary");

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("returns 200 for a manager with default current reporting week", async () => {
    const manager = await createManagerAgent();
    const expectedWeek = getCurrentReportingWeekStart();

    const response = await manager.get("/api/v1/dashboard/summary");

    expect(response.status).toBe(200);
    expect(response.body.data.weekStartDate).toBe(expectedWeek);
  });

  it("returns 200 for a manager when weekStartDate is a valid Monday", async () => {
    const manager = await createManagerAgent();

    const response = await manager.get(
      "/api/v1/dashboard/summary?weekStartDate=2026-09-07",
    );

    expect(response.status).toBe(200);
    expect(response.body.data.weekStartDate).toBe("2026-09-07");
  });

  it("returns 422 when weekStartDate is not a Monday", async () => {
    const manager = await createManagerAgent();

    const response = await manager.get(
      "/api/v1/dashboard/summary?weekStartDate=2026-09-12",
    );

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
