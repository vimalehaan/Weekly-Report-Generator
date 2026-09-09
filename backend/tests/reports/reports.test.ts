import {
  ReportStatus,
  ReviewAction,
  RoleName,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";
import { hashPassword } from "../../src/utils/password.js";

const app = createApp();
const TEST_EMAIL_PREFIX = "report-test-";
const TEST_PROJECT_PREFIX = "report-test-project-";
const TEST_TASK_TYPE_PREFIX = "report-test-task-type-";
const TEST_PASSWORD = "Password123!";

let weekOffset = 0;

function uniqueEmail(): string {
  return `${TEST_EMAIL_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function uniqueWeekDates(): { weekStartDate: string; weekEndDate: string } {
  weekOffset += 1;
  const weekStart = new Date(Date.UTC(2026, 0, 5 + weekOffset * 7));
  const weekEnd = new Date(Date.UTC(2026, 0, 9 + weekOffset * 7));

  return {
    weekStartDate: weekStart.toISOString().slice(0, 10),
    weekEndDate: weekEnd.toISOString().slice(0, 10),
  };
}

function validReportPayload(
  projectId: string,
  taskTypeId: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    ...uniqueWeekDates(),
    tasks: [
      {
        projectId,
        taskTypeId,
        taskName: "Implement feature",
        priority: TaskPriority.MEDIUM,
        plannedPercentage: 50,
        actualPercentage: 25,
        status: TaskStatus.IN_PROGRESS,
        plannedHours: 8,
        spentHours: 4,
        deliverable: "Feature branch",
      },
    ],
    nextWeekTasks: ["Continue implementation"],
    achievements: [
      {
        description: "Completed initial setup",
        isKeyAchievement: true,
      },
    ],
    blockers: [
      {
        description: "Waiting on API access",
        isKeyIssue: false,
      },
    ],
    notes: "Weekly progress notes",
    ...overrides,
  };
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

async function createTestProject(): Promise<{ id: string; name: string }> {
  const name = `${TEST_PROJECT_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return prisma.project.create({
    data: {
      name,
      description: "Test project",
    },
    select: { id: true, name: true },
  });
}

async function createTestTaskType(): Promise<{ id: string; name: string }> {
  const name = `${TEST_TASK_TYPE_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return prisma.taskType.create({
    data: {
      name,
      description: "Test task type",
    },
    select: { id: true, name: true },
  });
}

async function registerTeamMember() {
  const agent = request.agent(app);
  const email = uniqueEmail();

  await agent.post("/api/v1/auth/register").send({
    firstName: "Report",
    lastName: "Member",
    email,
    password: TEST_PASSWORD,
  });

  await agent.post("/api/v1/auth/login").send({
    email,
    password: TEST_PASSWORD,
  });

  return { email, password: TEST_PASSWORD, agent };
}

async function createManagerUser() {
  const email = uniqueEmail();
  const roleId = await getRoleId(RoleName.MANAGER);

  await prisma.user.create({
    data: {
      firstName: "Report",
      lastName: "Manager",
      email,
      passwordHash: await hashPassword(TEST_PASSWORD),
      roleId,
    },
  });

  const agent = request.agent(app);

  await agent.post("/api/v1/auth/login").send({
    email,
    password: TEST_PASSWORD,
  });

  return { email, password: TEST_PASSWORD, agent };
}

async function createReport(
  agent: ReturnType<typeof request.agent>,
  projectId: string,
  taskTypeId: string,
  overrides: Record<string, unknown> = {},
) {
  const payload = validReportPayload(projectId, taskTypeId, overrides);
  const response = await agent.post("/api/v1/reports").send(payload);

  return { response, payload };
}

async function cleanupTestData(): Promise<void> {
  const testUsers = await prisma.user.findMany({
    where: { email: { startsWith: TEST_EMAIL_PREFIX } },
    select: { id: true },
  });
  const userIds = testUsers.map((user) => user.id);

  if (userIds.length > 0) {
    const reports = await prisma.report.findMany({
      where: { userId: { in: userIds } },
      select: { id: true },
    });
    const reportIds = reports.map((report) => report.id);

    if (reportIds.length > 0) {
      const versions = await prisma.reportVersion.findMany({
        where: { reportId: { in: reportIds } },
        select: { id: true },
      });
      const versionIds = versions.map((version) => version.id);

      if (versionIds.length > 0) {
        await prisma.reportReview.deleteMany({
          where: { reportVersionId: { in: versionIds } },
        });
      }

      await prisma.reportStatusHistory.deleteMany({
        where: { reportId: { in: reportIds } },
      });
      await prisma.reportVersion.deleteMany({
        where: { reportId: { in: reportIds } },
      });
      await prisma.reportTask.deleteMany({
        where: { reportId: { in: reportIds } },
      });
      await prisma.achievement.deleteMany({
        where: { reportId: { in: reportIds } },
      });
      await prisma.blocker.deleteMany({
        where: { reportId: { in: reportIds } },
      });
      await prisma.report.deleteMany({
        where: { id: { in: reportIds } },
      });
    }

    await prisma.user.deleteMany({
      where: { id: { in: userIds } },
    });
  }

  await prisma.project.deleteMany({
    where: { name: { startsWith: TEST_PROJECT_PREFIX } },
  });

  await prisma.taskType.deleteMany({
    where: { name: { startsWith: TEST_TASK_TYPE_PREFIX } },
  });
}

function assertNoPasswordHash(value: unknown): void {
  if (value === null || typeof value !== "object") {
    return;
  }

  expect(value).not.toHaveProperty("passwordHash");

  for (const nested of Object.values(value)) {
    if (Array.isArray(nested)) {
      for (const item of nested) {
        assertNoPasswordHash(item);
      }
    } else if (nested !== null && typeof nested === "object") {
      assertNoPasswordHash(nested);
    }
  }
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

describe("Report creation and ownership", () => {
  it("allows an authenticated team member to create their own report", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response, payload } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe(ReportStatus.DRAFT);
    expect(response.body.data.weekStartDate).toContain(payload.weekStartDate);
  });

  it("creates a report belonging to the authenticated user", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );

    const meResponse = await member.agent.get("/api/v1/auth/me");

    expect(response.body.data.userId).toBe(meResponse.body.data.user.id);
  });

  it("allows a team member to retrieve their own report", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );

    const reportId = createResponse.body.data.id;
    const response = await member.agent.get(`/api/v1/reports/${reportId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(reportId);
  });

  it("prevents a team member from retrieving another member's report", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const owner = await registerTeamMember();
    const otherMember = await registerTeamMember();

    const { response: createResponse } = await createReport(
      owner.agent,
      project.id,
      taskType.id,
    );

    const response = await otherMember.agent.get(
      `/api/v1/reports/${createResponse.body.data.id}`,
    );

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("prevents a team member from updating another member's report", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const owner = await registerTeamMember();
    const otherMember = await registerTeamMember();

    const { response: createResponse } = await createReport(
      owner.agent,
      project.id,
      taskType.id,
    );

    const response = await otherMember.agent
      .patch(`/api/v1/reports/${createResponse.body.data.id}`)
      .send({ notes: "Unauthorized update" });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("returns only the authenticated team member's reports in the list", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const memberA = await registerTeamMember();
    const memberB = await registerTeamMember();

    await createReport(memberA.agent, project.id, taskType.id);
    await createReport(memberB.agent, project.id, taskType.id);

    const response = await memberA.agent.get("/api/v1/reports");

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBe(1);
    expect(response.body.data[0].user.email).toBe(memberA.email.toLowerCase());
  });
});

describe("Report update rules", () => {
  it("allows the owner to update a DRAFT report", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );

    const response = await member.agent
      .patch(`/api/v1/reports/${createResponse.body.data.id}`)
      .send({ notes: "Updated draft notes" });

    expect(response.status).toBe(200);
    expect(response.body.data.notes).toBe("Updated draft notes");
  });

  it("allows the owner to update a NEEDS_CORRECTION report", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/request-correction`)
      .send({ comment: "Please revise the task details" });

    const response = await member.agent
      .patch(`/api/v1/reports/${reportId}`)
      .send({ notes: "Corrected notes" });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe(ReportStatus.NEEDS_CORRECTION);
    expect(response.body.data.notes).toBe("Corrected notes");
  });

  it("prevents the owner from updating a SUBMITTED report", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await member.agent
      .patch(`/api/v1/reports/${reportId}`)
      .send({ notes: "Should fail" });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("REPORT_NOT_EDITABLE");
  });

  it("prevents the owner from updating an APPROVED report", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent.post(`/api/v1/reports/${reportId}/approve`).send({});

    const response = await member.agent
      .patch(`/api/v1/reports/${reportId}`)
      .send({ notes: "Should fail" });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("REPORT_NOT_EDITABLE");
  });

  it("does not create a new report version on PATCH", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    const versionsBefore = await member.agent.get(
      `/api/v1/reports/${reportId}/versions`,
    );

    await member.agent
      .patch(`/api/v1/reports/${reportId}`)
      .send({ notes: "Draft update" });

    const versionsAfter = await member.agent.get(
      `/api/v1/reports/${reportId}/versions`,
    );

    expect(versionsBefore.body.data).toHaveLength(0);
    expect(versionsAfter.body.data).toHaveLength(0);
  });

  it("does not create a status-history entry on PATCH", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    const historyBefore = await member.agent.get(
      `/api/v1/reports/${reportId}/status-history`,
    );

    await member.agent
      .patch(`/api/v1/reports/${reportId}`)
      .send({ notes: "Draft update" });

    const historyAfter = await member.agent.get(
      `/api/v1/reports/${reportId}/status-history`,
    );

    expect(historyBefore.body.data).toHaveLength(0);
    expect(historyAfter.body.data).toHaveLength(0);
  });
});

describe("Submission workflow", () => {
  it("submits a DRAFT report as SUBMITTED", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    const response = await member.agent.post(
      `/api/v1/reports/${reportId}/submit`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe(ReportStatus.SUBMITTED);
  });

  it("creates Version 1 on first submission", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const versionsResponse = await member.agent.get(
      `/api/v1/reports/${reportId}/versions`,
    );

    expect(versionsResponse.body.data).toHaveLength(1);
    expect(versionsResponse.body.data[0].versionNumber).toBe(1);
  });

  it("creates a status-history entry on submission", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const historyResponse = await member.agent.get(
      `/api/v1/reports/${reportId}/status-history`,
    );

    expect(historyResponse.body.data).toHaveLength(1);
    expect(historyResponse.body.data[0].fromStatus).toBe(ReportStatus.DRAFT);
    expect(historyResponse.body.data[0].toStatus).toBe(ReportStatus.SUBMITTED);
  });

  it("prevents submitting a report that is already SUBMITTED", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await member.agent.post(
      `/api/v1/reports/${reportId}/submit`,
    );

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("REPORT_NOT_SUBMITTABLE");
  });

  it("prevents submitting an APPROVED report", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent.post(`/api/v1/reports/${reportId}/approve`).send({});

    const response = await member.agent.post(
      `/api/v1/reports/${reportId}/submit`,
    );

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("REPORT_NOT_SUBMITTABLE");
  });

  it("prevents submitting a report without tasks", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
      { tasks: [] },
    );
    const reportId = createResponse.body.data.id;

    const response = await member.agent.post(
      `/api/v1/reports/${reportId}/submit`,
    );

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("INVALID_REPORT_CONTENT");
  });
});

describe("Manager correction workflow", () => {
  it("allows a manager to request correction on a submitted report", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await manager.agent
      .post(`/api/v1/reports/${reportId}/request-correction`)
      .send({ comment: "Please update spent hours" });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe(ReportStatus.NEEDS_CORRECTION);
  });

  it("records SUBMITTED to NEEDS_CORRECTION in status history", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/request-correction`)
      .send({ comment: "Needs revision" });

    const historyResponse = await manager.agent.get(
      `/api/v1/reports/${reportId}/status-history`,
    );

    const correctionEntry = historyResponse.body.data.find(
      (entry: { toStatus: ReportStatus }) =>
        entry.toStatus === ReportStatus.NEEDS_CORRECTION,
    );

    expect(correctionEntry).toBeDefined();
    expect(correctionEntry.fromStatus).toBe(ReportStatus.SUBMITTED);
  });

  it("persists the correction review", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/request-correction`)
      .send({ comment: "Fix task percentages" });

    const reviewsResponse = await manager.agent.get(
      `/api/v1/reports/${reportId}/reviews`,
    );

    expect(reviewsResponse.body.data).toHaveLength(1);
    expect(reviewsResponse.body.data[0].action).toBe(
      ReviewAction.REQUEST_CORRECTION,
    );
    expect(reviewsResponse.body.data[0].comment).toBe("Fix task percentages");
  });

  it("links the correction review to the current report version", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/request-correction`)
      .send({ comment: "Version check" });

    const reviewsResponse = await manager.agent.get(
      `/api/v1/reports/${reportId}/reviews`,
    );

    expect(reviewsResponse.body.data[0].reportVersion.versionNumber).toBe(1);
  });

  it("allows the team member to retrieve the report after correction", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/request-correction`)
      .send({ comment: "Please revise" });

    const response = await member.agent.get(`/api/v1/reports/${reportId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe(ReportStatus.NEEDS_CORRECTION);
  });

  it("allows the team member to edit the report while NEEDS_CORRECTION", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/request-correction`)
      .send({ comment: "Please revise" });

    const response = await member.agent
      .patch(`/api/v1/reports/${reportId}`)
      .send({ notes: "Revised after feedback" });

    expect(response.status).toBe(200);
    expect(response.body.data.notes).toBe("Revised after feedback");
  });
});

describe("Resubmission and approval", () => {
  it("resubmits a NEEDS_CORRECTION report as SUBMITTED", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/request-correction`)
      .send({ comment: "Revise" });
    await member.agent
      .patch(`/api/v1/reports/${reportId}`)
      .send({ notes: "Updated" });

    const response = await member.agent.post(
      `/api/v1/reports/${reportId}/submit`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe(ReportStatus.SUBMITTED);
  });

  it("creates Version 2 on resubmission", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/request-correction`)
      .send({ comment: "Revise" });
    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const versionsResponse = await member.agent.get(
      `/api/v1/reports/${reportId}/versions`,
    );

    expect(versionsResponse.body.data).toHaveLength(2);
    expect(versionsResponse.body.data[0].versionNumber).toBe(2);
    expect(versionsResponse.body.data[1].versionNumber).toBe(1);
  });

  it("leaves Version 1 unchanged after resubmission", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse, payload } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/request-correction`)
      .send({ comment: "Revise" });

    await member.agent.patch(`/api/v1/reports/${reportId}`).send({
      notes: "Changed notes for version 2",
      tasks: [
        {
          ...payload.tasks[0],
          taskName: "Updated task name",
        },
      ],
    });

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const versionOneResponse = await member.agent.get(
      `/api/v1/reports/${reportId}/versions/1`,
    );

    expect(versionOneResponse.body.data.content.tasks[0].taskName).toBe(
      "Implement feature",
    );
    expect(versionOneResponse.body.data.content.report.notes).toBe(
      "Weekly progress notes",
    );
  });

  it("allows a manager to approve a submitted report", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await manager.agent
      .post(`/api/v1/reports/${reportId}/approve`)
      .send({ comment: "Looks good" });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe(ReportStatus.APPROVED);
  });

  it("persists the approval review", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/approve`)
      .send({ comment: "Approved for release" });

    const reviewsResponse = await manager.agent.get(
      `/api/v1/reports/${reportId}/reviews`,
    );

    const approvalReview = reviewsResponse.body.data.find(
      (review: { action: ReviewAction }) =>
        review.action === ReviewAction.APPROVE,
    );

    expect(approvalReview).toBeDefined();
    expect(approvalReview.comment).toBe("Approved for release");
  });

  it("records approval in status history", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/approve`)
      .send({ comment: "Approved" });

    const historyResponse = await manager.agent.get(
      `/api/v1/reports/${reportId}/status-history`,
    );

    const approvalEntry = historyResponse.body.data.find(
      (entry: { toStatus: ReportStatus }) =>
        entry.toStatus === ReportStatus.APPROVED,
    );

    expect(approvalEntry).toBeDefined();
    expect(approvalEntry.fromStatus).toBe(ReportStatus.SUBMITTED);
  });

  it("prevents the team member from editing an approved report", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent.post(`/api/v1/reports/${reportId}/approve`).send({});

    const response = await member.agent
      .patch(`/api/v1/reports/${reportId}`)
      .send({ notes: "Should fail" });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("REPORT_NOT_EDITABLE");
  });
});

describe("Version APIs", () => {
  it("allows the owner to retrieve their own versions", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await member.agent.get(
      `/api/v1/reports/${reportId}/versions`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it("allows a manager to retrieve versions for any report", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await manager.agent.get(
      `/api/v1/reports/${reportId}/versions`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });

  it("returns versions newest first", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/request-correction`)
      .send({ comment: "Revise" });
    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await member.agent.get(
      `/api/v1/reports/${reportId}/versions`,
    );

    expect(response.body.data.map((v: { versionNumber: number }) => v.versionNumber)).toEqual([
      2, 1,
    ]);
  });

  it("retrieves Version 1 by version number", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await member.agent.get(
      `/api/v1/reports/${reportId}/versions/1`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.versionNumber).toBe(1);
  });

  it("retrieves Version 2 by version number", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/request-correction`)
      .send({ comment: "Revise" });
    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await member.agent.get(
      `/api/v1/reports/${reportId}/versions/2`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.versionNumber).toBe(2);
  });

  it("returns 404 for a nonexistent version number", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await member.agent.get(
      `/api/v1/reports/${reportId}/versions/99`,
    );

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("REPORT_VERSION_NOT_FOUND");
  });

  it("prevents a team member from accessing another member's versions list", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const owner = await registerTeamMember();
    const otherMember = await registerTeamMember();

    const { response: createResponse } = await createReport(
      owner.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await owner.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await otherMember.agent.get(
      `/api/v1/reports/${reportId}/versions`,
    );

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("REPORT_NOT_FOUND");
  });

  it("prevents a team member from accessing another member's version by number", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const owner = await registerTeamMember();
    const otherMember = await registerTeamMember();

    const { response: createResponse } = await createReport(
      owner.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await owner.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await otherMember.agent.get(
      `/api/v1/reports/${reportId}/versions/1`,
    );

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("REPORT_VERSION_NOT_FOUND");
  });
});

describe("Reviews and status history", () => {
  it("allows a manager to retrieve review history", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/request-correction`)
      .send({ comment: "Needs work" });

    const response = await manager.agent.get(
      `/api/v1/reports/${reportId}/reviews`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("includes version information in review responses", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/approve`)
      .send({ comment: "Approved" });

    const response = await manager.agent.get(
      `/api/v1/reports/${reportId}/reviews`,
    );

    expect(response.body.data[0].reportVersion).toMatchObject({
      versionNumber: 1,
    });
    expect(response.body.data[0].reportVersion.id).toBeDefined();
  });

  it("allows a manager to retrieve status history", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await manager.agent.get(
      `/api/v1/reports/${reportId}/status-history`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("allows the report owner to retrieve their own status history", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await member.agent.get(
      `/api/v1/reports/${reportId}/status-history`,
    );

    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("prevents another team member from retrieving status history", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const owner = await registerTeamMember();
    const otherMember = await registerTeamMember();

    const { response: createResponse } = await createReport(
      owner.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await owner.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await otherMember.agent.get(
      `/api/v1/reports/${reportId}/status-history`,
    );

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("does not expose password hashes in review or status-history responses", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/approve`)
      .send({ comment: "Approved" });

    const reviewsResponse = await manager.agent.get(
      `/api/v1/reports/${reportId}/reviews`,
    );
    const historyResponse = await manager.agent.get(
      `/api/v1/reports/${reportId}/status-history`,
    );

    assertNoPasswordHash(reviewsResponse.body);
    assertNoPasswordHash(historyResponse.body);
  });
});

describe("RBAC", () => {
  it("returns 403 when a team member requests correction", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await member.agent
      .post(`/api/v1/reports/${reportId}/request-correction`)
      .send({ comment: "Self correction" });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("returns 403 when a team member approves a report", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const response = await member.agent
      .post(`/api/v1/reports/${reportId}/approve`)
      .send({ comment: "Self approve" });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("returns 403 when a team member retrieves manager-only reviews", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);
    await manager.agent
      .post(`/api/v1/reports/${reportId}/approve`)
      .send({ comment: "Approved" });

    const response = await member.agent.get(
      `/api/v1/reports/${reportId}/reviews`,
    );

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("allows a manager to retrieve another member's report", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
    );
    const reportId = createResponse.body.data.id;

    const response = await manager.agent.get(`/api/v1/reports/${reportId}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(reportId);
  });
});

describe("Version immutability", () => {
  it("preserves Version 1 content after correction, edit, and resubmission", async () => {
    const project = await createTestProject();
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const manager = await createManagerUser();

    const { response: createResponse } = await createReport(
      member.agent,
      project.id,
      taskType.id,
      {
        tasks: [
          {
            projectId: project.id,
            taskTypeId: taskType.id,
            taskName: "Original submitted task",
            priority: TaskPriority.MEDIUM,
            plannedPercentage: 50,
            actualPercentage: 25,
            status: TaskStatus.IN_PROGRESS,
            plannedHours: 8,
            spentHours: 4,
          },
        ],
        notes: "Original submitted notes",
      },
    );
    const reportId = createResponse.body.data.id;

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    await manager.agent
      .post(`/api/v1/reports/${reportId}/request-correction`)
      .send({ comment: "Update the task description" });

    await member.agent.patch(`/api/v1/reports/${reportId}`).send({
      notes: "Updated notes for version 2",
      tasks: [
        {
          projectId: project.id,
          taskTypeId: taskType.id,
          taskName: "Updated submitted task",
          priority: TaskPriority.HIGH,
          plannedPercentage: 80,
          actualPercentage: 60,
          status: TaskStatus.IN_PROGRESS,
          plannedHours: 10,
          spentHours: 6,
        },
      ],
    });

    await member.agent.post(`/api/v1/reports/${reportId}/submit`);

    const versionOneResponse = await member.agent.get(
      `/api/v1/reports/${reportId}/versions/1`,
    );
    const versionTwoResponse = await member.agent.get(
      `/api/v1/reports/${reportId}/versions/2`,
    );

    expect(versionOneResponse.body.data.content.tasks[0].taskName).toBe(
      "Original submitted task",
    );
    expect(versionOneResponse.body.data.content.report.notes).toBe(
      "Original submitted notes",
    );
    expect(versionTwoResponse.body.data.content.tasks[0].taskName).toBe(
      "Updated submitted task",
    );
    expect(versionTwoResponse.body.data.content.report.notes).toBe(
      "Updated notes for version 2",
    );
  });
});

describe("Validation", () => {
  it("returns 422 for an invalid report body", async () => {
    const member = await registerTeamMember();

    const response = await member.agent.post("/api/v1/reports").send({
      weekStartDate: "2026-02-01",
      weekEndDate: "2026-01-01",
      tasks: [],
      nextWeekTasks: [],
      achievements: [],
      blockers: [],
    });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 404 when creating a report with a nonexistent project", async () => {
    const taskType = await createTestTaskType();
    const member = await registerTeamMember();
    const fakeProjectId = "00000000-0000-4000-8000-000000000001";

    const response = await member.agent
      .post("/api/v1/reports")
      .send(validReportPayload(fakeProjectId, taskType.id));

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("PROJECT_NOT_FOUND");
  });

  it("returns 404 when creating a report with a nonexistent task type", async () => {
    const project = await createTestProject();
    const member = await registerTeamMember();
    const fakeTaskTypeId = "00000000-0000-4000-8000-000000000002";

    const response = await member.agent
      .post("/api/v1/reports")
      .send(validReportPayload(project.id, fakeTaskTypeId));

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("TASK_TYPE_NOT_FOUND");
  });

  it("returns 422 for an invalid GET /reports query parameter", async () => {
    const member = await registerTeamMember();

    const response = await member.agent.get("/api/v1/reports?page=0");

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
