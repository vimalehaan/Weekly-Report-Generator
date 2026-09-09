import { RoleName } from "@prisma/client";
import request from "supertest";
import { createApp } from "../../src/app.js";
import { prisma } from "../../src/config/database.js";
import { hashPassword } from "../../src/utils/password.js";

const app = createApp();
const TEST_EMAIL_PREFIX = "auth-test-";
const TEST_PASSWORD = "Password123!";

function uniqueEmail(): string {
  return `${TEST_EMAIL_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

function validRegistration(overrides: Record<string, string> = {}) {
  return {
    firstName: "Test",
    lastName: "User",
    email: uniqueEmail(),
    password: TEST_PASSWORD,
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

async function cleanupTestUsers(): Promise<void> {
  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: TEST_EMAIL_PREFIX,
      },
    },
  });
}

async function getTeamMemberRoleId(): Promise<string> {
  const role = await prisma.role.findUniqueOrThrow({
    where: { name: RoleName.TEAM_MEMBER },
    select: { id: true },
  });

  return role.id;
}

beforeAll(async () => {
  await ensureRoles();
});

afterEach(async () => {
  await cleanupTestUsers();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/v1/auth/register", () => {
  it("returns 201 for valid registration", async () => {
    const payload = validRegistration();

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body.data.user.email).toBe(payload.email.toLowerCase());
  });

  it("does not return passwordHash in the response", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(validRegistration());

    expect(response.status).toBe(201);
    expect(response.body.data.user).not.toHaveProperty("passwordHash");
  });

  it("returns 409 for duplicate email", async () => {
    const payload = validRegistration();

    await request(app).post("/api/v1/auth/register").send(payload);

    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        ...payload,
        firstName: "Another",
      });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("DUPLICATE_EMAIL");
  });

  it("returns 422 for invalid email", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(validRegistration({ email: "not-an-email" }));

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("returns 422 when password is shorter than the minimum", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(validRegistration({ password: "short" }));

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("POST /api/v1/auth/login", () => {
  it("returns 200 for valid credentials", async () => {
    const payload = validRegistration();

    await request(app).post("/api/v1/auth/register").send(payload);

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: payload.email,
        password: payload.password,
      });

    expect(response.status).toBe(200);
  });

  it("sets an HTTP-only accessToken cookie", async () => {
    const payload = validRegistration();

    await request(app).post("/api/v1/auth/register").send(payload);

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: payload.email,
        password: payload.password,
      });

    const setCookie = response.headers["set-cookie"];

    expect(setCookie).toBeDefined();
    expect(setCookie?.[0]).toMatch(/accessToken=/);
    expect(setCookie?.[0]).toMatch(/HttpOnly/i);
  });

  it("returns a safe user without passwordHash", async () => {
    const payload = validRegistration();

    await request(app).post("/api/v1/auth/register").send(payload);

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: payload.email,
        password: payload.password,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.user).not.toHaveProperty("passwordHash");
    expect(response.body.data.user.email).toBe(payload.email.toLowerCase());
  });

  it("returns 401 for wrong password", async () => {
    const payload = validRegistration();

    await request(app).post("/api/v1/auth/register").send(payload);

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: payload.email,
        password: "WrongPassword123!",
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 for nonexistent email", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: `${TEST_EMAIL_PREFIX}missing@example.com`,
        password: TEST_PASSWORD,
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 401 for inactive user", async () => {
    const email = uniqueEmail();
    const roleId = await getTeamMemberRoleId();

    await prisma.user.create({
      data: {
        firstName: "Inactive",
        lastName: "User",
        email,
        passwordHash: await hashPassword(TEST_PASSWORD),
        roleId,
        isActive: false,
      },
    });

    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email,
        password: TEST_PASSWORD,
      });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("returns 422 for invalid request body", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: "not-an-email",
        password: "",
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/v1/auth/me", () => {
  it("returns 200 for an authenticated request", async () => {
    const payload = validRegistration();
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/register").send(payload);
    await agent.post("/api/v1/auth/login").send({
      email: payload.email,
      password: payload.password,
    });

    const response = await agent.get("/api/v1/auth/me");

    expect(response.status).toBe(200);
  });

  it("returns the authenticated user", async () => {
    const payload = validRegistration();
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/register").send(payload);
    await agent.post("/api/v1/auth/login").send({
      email: payload.email,
      password: payload.password,
    });

    const response = await agent.get("/api/v1/auth/me");

    expect(response.body.data.user.email).toBe(payload.email.toLowerCase());
    expect(response.body.data.user.firstName).toBe("Test");
    expect(response.body.data.user.lastName).toBe("User");
  });

  it("returns 401 when unauthenticated", async () => {
    const response = await request(app).get("/api/v1/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });
});

describe("POST /api/v1/auth/logout", () => {
  it("returns 200", async () => {
    const payload = validRegistration();
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/register").send(payload);
    await agent.post("/api/v1/auth/login").send({
      email: payload.email,
      password: payload.password,
    });

    const response = await agent.post("/api/v1/auth/logout");

    expect(response.status).toBe(200);
    expect(response.body.data.message).toBe("Logged out successfully");
  });

  it("clears the accessToken cookie", async () => {
    const payload = validRegistration();
    const agent = request.agent(app);

    await agent.post("/api/v1/auth/register").send(payload);
    await agent.post("/api/v1/auth/login").send({
      email: payload.email,
      password: payload.password,
    });

    const response = await agent.post("/api/v1/auth/logout");
    const setCookie = response.headers["set-cookie"];

    expect(setCookie).toBeDefined();
    expect(setCookie?.[0]).toMatch(/accessToken=;/);
  });
});
