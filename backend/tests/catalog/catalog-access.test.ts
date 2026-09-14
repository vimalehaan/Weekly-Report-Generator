import { RoleName } from "@prisma/client";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";
import { hashPassword } from "../../src/utils/password.js";

const app = createApp();
const TEST_EMAIL_PREFIX = "catalog-test-";
const TEST_PROJECT_PREFIX = "catalog-test-project-";
const TEST_TASK_TYPE_PREFIX = "catalog-test-task-type-";
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

async function createTestProject(): Promise<{ id: string; name: string }> {
  const name = `${TEST_PROJECT_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return prisma.project.create({
    data: {
      name,
      description: "Catalog test project",
    },
    select: { id: true, name: true },
  });
}

async function createTestTaskType(): Promise<{ id: string; name: string }> {
  const name = `${TEST_TASK_TYPE_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return prisma.taskType.create({
    data: {
      name,
      description: "Catalog test task type",
    },
    select: { id: true, name: true },
  });
}

async function registerTeamMemberAgent() {
  const agent = request.agent(app);
  const email = uniqueEmail();

  await agent.post("/api/v1/auth/register").send({
    firstName: "Catalog",
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
      firstName: "Catalog",
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
  await prisma.project.deleteMany({
    where: { name: { startsWith: TEST_PROJECT_PREFIX } },
  });

  await prisma.taskType.deleteMany({
    where: { name: { startsWith: TEST_TASK_TYPE_PREFIX } },
  });

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

describe("Projects and task types read access", () => {
  it("returns 401 for unauthenticated GET /api/v1/projects", async () => {
    const response = await request(app).get("/api/v1/projects");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 for unauthenticated GET /api/v1/task-types", async () => {
    const response = await request(app).get("/api/v1/task-types");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("allows TEAM_MEMBER to GET /api/v1/projects", async () => {
    const project = await createTestProject();
    const memberAgent = await registerTeamMemberAgent();

    const response = await memberAgent.get("/api/v1/projects");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.some((item: { id: string }) => item.id === project.id)).toBe(
      true,
    );
  });

  it("allows TEAM_MEMBER to GET /api/v1/projects/:id", async () => {
    const project = await createTestProject();
    const memberAgent = await registerTeamMemberAgent();

    const response = await memberAgent.get(`/api/v1/projects/${project.id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(project.id);
    expect(response.body.data.name).toBe(project.name);
  });

  it("allows TEAM_MEMBER to GET /api/v1/task-types", async () => {
    const taskType = await createTestTaskType();
    const memberAgent = await registerTeamMemberAgent();

    const response = await memberAgent.get("/api/v1/task-types");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(
      response.body.data.some((item: { id: string }) => item.id === taskType.id),
    ).toBe(true);
  });

  it("allows TEAM_MEMBER to GET /api/v1/task-types/:id", async () => {
    const taskType = await createTestTaskType();
    const memberAgent = await registerTeamMemberAgent();

    const response = await memberAgent.get(`/api/v1/task-types/${taskType.id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(taskType.id);
    expect(response.body.data.name).toBe(taskType.name);
  });

  it("returns 403 for TEAM_MEMBER project mutations", async () => {
    const project = await createTestProject();
    const memberAgent = await registerTeamMemberAgent();

    const createResponse = await memberAgent
      .post("/api/v1/projects")
      .send({ name: `${TEST_PROJECT_PREFIX}blocked` });

    expect(createResponse.status).toBe(403);
    expect(createResponse.body.error.code).toBe("FORBIDDEN");

    const patchResponse = await memberAgent
      .patch(`/api/v1/projects/${project.id}`)
      .send({ name: `${TEST_PROJECT_PREFIX}updated` });

    expect(patchResponse.status).toBe(403);
    expect(patchResponse.body.error.code).toBe("FORBIDDEN");

    const deleteResponse = await memberAgent.delete(
      `/api/v1/projects/${project.id}`,
    );

    expect(deleteResponse.status).toBe(403);
    expect(deleteResponse.body.error.code).toBe("FORBIDDEN");
  });

  it("returns 403 for TEAM_MEMBER task-type mutations", async () => {
    const taskType = await createTestTaskType();
    const memberAgent = await registerTeamMemberAgent();

    const createResponse = await memberAgent
      .post("/api/v1/task-types")
      .send({ name: `${TEST_TASK_TYPE_PREFIX}blocked` });

    expect(createResponse.status).toBe(403);
    expect(createResponse.body.error.code).toBe("FORBIDDEN");

    const patchResponse = await memberAgent
      .patch(`/api/v1/task-types/${taskType.id}`)
      .send({ name: `${TEST_TASK_TYPE_PREFIX}updated` });

    expect(patchResponse.status).toBe(403);
    expect(patchResponse.body.error.code).toBe("FORBIDDEN");

    const deleteResponse = await memberAgent.delete(
      `/api/v1/task-types/${taskType.id}`,
    );

    expect(deleteResponse.status).toBe(403);
    expect(deleteResponse.body.error.code).toBe("FORBIDDEN");
  });

  it("allows MANAGER full project access", async () => {
    const managerAgent = await createManagerAgent();
    const projectName = `${TEST_PROJECT_PREFIX}manager-${Date.now()}`;

    const createResponse = await managerAgent
      .post("/api/v1/projects")
      .send({ name: projectName, description: "Manager created" });

    expect(createResponse.status).toBe(201);
    const projectId = createResponse.body.data.id as string;

    const listResponse = await managerAgent.get("/api/v1/projects");
    expect(listResponse.status).toBe(200);
    expect(
      listResponse.body.data.some((item: { id: string }) => item.id === projectId),
    ).toBe(true);

    const getResponse = await managerAgent.get(`/api/v1/projects/${projectId}`);
    expect(getResponse.status).toBe(200);

    const patchResponse = await managerAgent
      .patch(`/api/v1/projects/${projectId}`)
      .send({ description: "Updated by manager" });
    expect(patchResponse.status).toBe(200);

    const deleteResponse = await managerAgent.delete(
      `/api/v1/projects/${projectId}`,
    );
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.isActive).toBe(false);
  });

  it("allows MANAGER full task-type access", async () => {
    const managerAgent = await createManagerAgent();
    const taskTypeName = `${TEST_TASK_TYPE_PREFIX}manager-${Date.now()}`;

    const createResponse = await managerAgent
      .post("/api/v1/task-types")
      .send({ name: taskTypeName, description: "Manager created" });

    expect(createResponse.status).toBe(201);
    const taskTypeId = createResponse.body.data.id as string;

    const listResponse = await managerAgent.get("/api/v1/task-types");
    expect(listResponse.status).toBe(200);
    expect(
      listResponse.body.data.some(
        (item: { id: string }) => item.id === taskTypeId,
      ),
    ).toBe(true);

    const getResponse = await managerAgent.get(
      `/api/v1/task-types/${taskTypeId}`,
    );
    expect(getResponse.status).toBe(200);

    const patchResponse = await managerAgent
      .patch(`/api/v1/task-types/${taskTypeId}`)
      .send({ description: "Updated by manager" });
    expect(patchResponse.status).toBe(200);

    const deleteResponse = await managerAgent.delete(
      `/api/v1/task-types/${taskTypeId}`,
    );
    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body.data.isActive).toBe(false);
  });
});
