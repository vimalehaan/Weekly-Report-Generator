import bcrypt from "bcrypt";
import {
  Prisma,
  PrismaClient,
  ReportStatus,
  ReviewAction,
  RoleName,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

/** Development password for all seeded accounts. Never log this value. */
const SEED_PASSWORD = "Password123!";
const BCRYPT_ROUNDS = 10;

type NextWeekTask = {
  task: string;
  priority: keyof typeof TaskPriority;
};

type SeedTaskInput = {
  projectName: string;
  taskTypeName?: string;
  taskName: string;
  priority: TaskPriority;
  plannedPercentage: number;
  actualPercentage: number;
  status: TaskStatus;
  plannedHours: number;
  spentHours: number;
  deliverable?: string;
};

type SeedAchievementInput = {
  description: string;
  isKeyAchievement: boolean;
};

type SeedBlockerInput = {
  description: string;
  isKeyIssue: boolean;
};

type StatusTransition = {
  fromStatus: ReportStatus | null;
  toStatus: ReportStatus;
  changedByEmail: string;
  comment?: string;
  createdAtOffsetHours: number;
};

type SeedVersionInput = {
  versionNumber: number;
  createdByEmail: string;
  notes: string;
  nextWeekTasks: NextWeekTask[];
  tasks: SeedTaskInput[];
  achievements: SeedAchievementInput[];
  blockers: SeedBlockerInput[];
  createdAtOffsetHours: number;
};

type SeedReviewInput = {
  versionNumber: number;
  reviewerEmail: string;
  action: ReviewAction;
  comment?: string;
  createdAtOffsetHours: number;
};

type SeedReportInput = {
  userEmail: string;
  weekStart: string;
  status: ReportStatus;
  notes: string;
  nextWeekTasks: NextWeekTask[];
  tasks: SeedTaskInput[];
  achievements: SeedAchievementInput[];
  blockers: SeedBlockerInput[];
  statusHistory: StatusTransition[];
  versions?: SeedVersionInput[];
  reviews?: SeedReviewInput[];
};

function weekRange(weekStart: string): { weekStartDate: Date; weekEndDate: Date } {
  const weekStartDate = new Date(`${weekStart}T00:00:00.000Z`);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setUTCDate(weekEndDate.getUTCDate() + 6);
  return { weekStartDate, weekEndDate };
}

function hours(value: number): Prisma.Decimal {
  return new Prisma.Decimal(value.toFixed(2));
}

function offsetDate(base: Date, hours: number): Date {
  return new Date(base.getTime() + hours * 60 * 60 * 1000);
}

async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, BCRYPT_ROUNDS);
}

function buildReportSnapshot(input: {
  weekStartDate: Date;
  weekEndDate: Date;
  status: ReportStatus;
  notes: string;
  nextWeekTasks: NextWeekTask[];
  tasks: SeedTaskInput[];
  achievements: SeedAchievementInput[];
  blockers: SeedBlockerInput[];
}) {
  return {
    report: {
      weekStartDate: input.weekStartDate.toISOString().slice(0, 10),
      weekEndDate: input.weekEndDate.toISOString().slice(0, 10),
      status: input.status,
      notes: input.notes,
      nextWeekTasks: input.nextWeekTasks,
    },
    tasks: input.tasks,
    achievements: input.achievements,
    blockers: input.blockers,
  };
}

async function clearReportChildren(reportId: string): Promise<void> {
  await prisma.reportReview.deleteMany({
    where: { reportVersion: { reportId } },
  });
  await prisma.reportVersion.deleteMany({ where: { reportId } });
  await prisma.reportStatusHistory.deleteMany({ where: { reportId } });
  await prisma.reportTask.deleteMany({ where: { reportId } });
  await prisma.achievement.deleteMany({ where: { reportId } });
  await prisma.blocker.deleteMany({ where: { reportId } });
}

async function seedRoles() {
  const roles = await Promise.all(
    [RoleName.TEAM_MEMBER, RoleName.MANAGER].map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  return {
    teamMember: roles.find((role) => role.name === RoleName.TEAM_MEMBER)!,
    manager: roles.find((role) => role.name === RoleName.MANAGER)!,
  };
}

async function seedUsers(roles: { teamMember: { id: string }; manager: { id: string } }) {
  const passwordHash = await hashPassword(SEED_PASSWORD);

  const userDefinitions = [
    {
      email: "sarah.chen@example.com",
      firstName: "Sarah",
      lastName: "Chen",
      roleId: roles.manager.id,
    },
    {
      email: "alex.jordan@example.com",
      firstName: "Alex",
      lastName: "Jordan",
      roleId: roles.teamMember.id,
    },
    {
      email: "morgan.lee@example.com",
      firstName: "Morgan",
      lastName: "Lee",
      roleId: roles.teamMember.id,
    },
    {
      email: "riley.patel@example.com",
      firstName: "Riley",
      lastName: "Patel",
      roleId: roles.teamMember.id,
    },
    {
      email: "casey.nguyen@example.com",
      firstName: "Casey",
      lastName: "Nguyen",
      roleId: roles.teamMember.id,
    },
  ];

  const users = await Promise.all(
    userDefinitions.map((user) =>
      prisma.user.upsert({
        where: { email: user.email },
        update: {
          firstName: user.firstName,
          lastName: user.lastName,
          roleId: user.roleId,
          isActive: true,
          passwordHash,
        },
        create: {
          ...user,
          passwordHash,
          isActive: true,
        },
      }),
    ),
  );

  return Object.fromEntries(users.map((user) => [user.email, user])) as Record<
    string,
    (typeof users)[number]
  >;
}

async function seedProjects() {
  const projectDefinitions = [
    {
      name: "Website Redesign",
      description: "Modernize the public marketing website and improve conversion flows.",
    },
    {
      name: "Mobile Application",
      description: "Cross-platform mobile app for customer self-service.",
    },
    {
      name: "Internal Dashboard",
      description: "Manager and operations dashboard for weekly reporting and analytics.",
    },
    {
      name: "API Development",
      description: "REST API services supporting dashboard and mobile clients.",
    },
  ];

  const projects = await Promise.all(
    projectDefinitions.map((project) =>
      prisma.project.upsert({
        where: { name: project.name },
        update: {
          description: project.description,
          isActive: true,
        },
        create: {
          ...project,
          isActive: true,
        },
      }),
    ),
  );

  return Object.fromEntries(projects.map((project) => [project.name, project])) as Record<
    string,
    (typeof projects)[number]
  >;
}

async function seedTaskTypes() {
  const taskTypeDefinitions = [
    { name: "Development", description: "Feature implementation and bug fixes." },
    { name: "Testing", description: "Manual and automated quality assurance work." },
    { name: "Documentation", description: "Technical writing, guides, and release notes." },
    { name: "Meetings", description: "Planning, standups, and stakeholder syncs." },
    { name: "Research", description: "Spikes, proof-of-concepts, and technical discovery." },
  ];

  const taskTypes = await Promise.all(
    taskTypeDefinitions.map((taskType) =>
      prisma.taskType.upsert({
        where: { name: taskType.name },
        update: {
          description: taskType.description,
        },
        create: taskType,
      }),
    ),
  );

  return Object.fromEntries(taskTypes.map((taskType) => [taskType.name, taskType])) as Record<
    string,
    (typeof taskTypes)[number]
  >;
}

async function createReportTasks(
  reportId: string,
  tasks: SeedTaskInput[],
  projects: Record<string, { id: string }>,
  taskTypes: Record<string, { id: string }>,
) {
  await prisma.reportTask.createMany({
    data: tasks.map((task) => ({
      reportId,
      projectId: projects[task.projectName]!.id,
      taskTypeId: task.taskTypeName ? taskTypes[task.taskTypeName]!.id : null,
      taskName: task.taskName,
      priority: task.priority,
      plannedPercentage: task.plannedPercentage,
      actualPercentage: task.actualPercentage,
      status: task.status,
      plannedHours: hours(task.plannedHours),
      spentHours: hours(task.spentHours),
      deliverable: task.deliverable,
    })),
  });
}

async function createAchievements(reportId: string, achievements: SeedAchievementInput[]) {
  if (achievements.length === 0) {
    return;
  }

  await prisma.achievement.createMany({
    data: achievements.map((achievement) => ({
      reportId,
      description: achievement.description,
      isKeyAchievement: achievement.isKeyAchievement,
    })),
  });
}

async function createBlockers(reportId: string, blockers: SeedBlockerInput[]) {
  if (blockers.length === 0) {
    return;
  }

  await prisma.blocker.createMany({
    data: blockers.map((blocker) => ({
      reportId,
      description: blocker.description,
      isKeyIssue: blocker.isKeyIssue,
    })),
  });
}

async function seedReport(
  input: SeedReportInput,
  users: Record<string, { id: string }>,
  projects: Record<string, { id: string }>,
  taskTypes: Record<string, { id: string }>,
) {
  const user = users[input.userEmail]!;
  const { weekStartDate, weekEndDate } = weekRange(input.weekStart);
  const baseCreatedAt = weekStartDate;

  const report = await prisma.report.upsert({
    where: {
      userId_weekStartDate: {
        userId: user.id,
        weekStartDate,
      },
    },
    update: {
      weekEndDate,
      status: input.status,
      notes: input.notes,
      nextWeekTasks: input.nextWeekTasks,
    },
    create: {
      userId: user.id,
      weekStartDate,
      weekEndDate,
      status: input.status,
      notes: input.notes,
      nextWeekTasks: input.nextWeekTasks,
    },
  });

  await clearReportChildren(report.id);

  await createReportTasks(report.id, input.tasks, projects, taskTypes);
  await createAchievements(report.id, input.achievements);
  await createBlockers(report.id, input.blockers);

  for (const transition of input.statusHistory) {
    await prisma.reportStatusHistory.create({
      data: {
        reportId: report.id,
        changedBy: users[transition.changedByEmail]!.id,
        fromStatus: transition.fromStatus,
        toStatus: transition.toStatus,
        comment: transition.comment,
        createdAt: offsetDate(baseCreatedAt, transition.createdAtOffsetHours),
      },
    });
  }

  const versionRecords = new Map<number, { id: string }>();

  for (const version of input.versions ?? []) {
    const createdBy = users[version.createdByEmail]!;
    const versionWeekRange = weekRange(input.weekStart);
    const content = buildReportSnapshot({
      weekStartDate: versionWeekRange.weekStartDate,
      weekEndDate: versionWeekRange.weekEndDate,
      status: ReportStatus.SUBMITTED,
      notes: version.notes,
      nextWeekTasks: version.nextWeekTasks,
      tasks: version.tasks,
      achievements: version.achievements,
      blockers: version.blockers,
    });

    const record = await prisma.reportVersion.create({
      data: {
        reportId: report.id,
        versionNumber: version.versionNumber,
        content,
        createdBy: createdBy.id,
        createdAt: offsetDate(baseCreatedAt, version.createdAtOffsetHours),
      },
    });

    versionRecords.set(version.versionNumber, record);
  }

  for (const review of input.reviews ?? []) {
    const version = versionRecords.get(review.versionNumber);
    if (!version) {
      throw new Error(
        `Missing report version ${review.versionNumber} for ${input.userEmail} week ${input.weekStart}`,
      );
    }

    await prisma.reportReview.create({
      data: {
        reportVersionId: version.id,
        reviewerId: users[review.reviewerEmail]!.id,
        action: review.action,
        comment: review.comment,
        createdAt: offsetDate(baseCreatedAt, review.createdAtOffsetHours),
      },
    });
  }

  return report;
}

function buildReportDefinitions(): SeedReportInput[] {
  return [
    {
      userEmail: "alex.jordan@example.com",
      weekStart: "2026-09-01",
      status: ReportStatus.DRAFT,
      notes: "Draft in progress for the current reporting week.",
      nextWeekTasks: [
        { task: "Complete dashboard filter UI", priority: "HIGH" },
        { task: "Write unit tests for report service", priority: "MEDIUM" },
      ],
      tasks: [
        {
          projectName: "Internal Dashboard",
          taskTypeName: "Development",
          taskName: "Implement report list filters",
          priority: TaskPriority.HIGH,
          plannedPercentage: 60,
          actualPercentage: 35,
          status: TaskStatus.IN_PROGRESS,
          plannedHours: 12,
          spentHours: 6.5,
          deliverable: "Filter panel component",
        },
        {
          projectName: "API Development",
          taskTypeName: "Meetings",
          taskName: "API contract review with frontend team",
          priority: TaskPriority.MEDIUM,
          plannedPercentage: 20,
          actualPercentage: 20,
          status: TaskStatus.COMPLETED,
          plannedHours: 2,
          spentHours: 2,
        },
        {
          projectName: "Website Redesign",
          taskTypeName: "Research",
          taskName: "Evaluate accessibility tooling options",
          priority: TaskPriority.LOW,
          plannedPercentage: 20,
          actualPercentage: 0,
          status: TaskStatus.NOT_STARTED,
          plannedHours: 4,
          spentHours: 0,
        },
      ],
      achievements: [
        {
          description: "Aligned dashboard filter requirements with the product team.",
          isKeyAchievement: false,
        },
      ],
      blockers: [
        {
          description: "Waiting on final API pagination contract before finishing filters.",
          isKeyIssue: true,
        },
      ],
      statusHistory: [
        {
          fromStatus: null,
          toStatus: ReportStatus.DRAFT,
          changedByEmail: "alex.jordan@example.com",
          comment: "Report created.",
          createdAtOffsetHours: 1,
        },
      ],
    },
    {
      userEmail: "alex.jordan@example.com",
      weekStart: "2026-08-25",
      status: ReportStatus.APPROVED,
      notes: "Approved report for the previous week with stable delivery across tasks.",
      nextWeekTasks: [
        { task: "Start dashboard filter implementation", priority: "HIGH" },
        { task: "Review mobile onboarding mockups", priority: "LOW" },
      ],
      tasks: [
        {
          projectName: "Internal Dashboard",
          taskTypeName: "Development",
          taskName: "Build manager summary cards",
          priority: TaskPriority.HIGH,
          plannedPercentage: 50,
          actualPercentage: 50,
          status: TaskStatus.COMPLETED,
          plannedHours: 10,
          spentHours: 10,
          deliverable: "Summary cards on dashboard home",
        },
        {
          projectName: "API Development",
          taskTypeName: "Testing",
          taskName: "Add integration tests for report endpoints",
          priority: TaskPriority.MEDIUM,
          plannedPercentage: 30,
          actualPercentage: 30,
          status: TaskStatus.COMPLETED,
          plannedHours: 6,
          spentHours: 6,
        },
        {
          projectName: "Mobile Application",
          taskTypeName: "Documentation",
          taskName: "Document mobile auth flow changes",
          priority: TaskPriority.LOW,
          plannedPercentage: 20,
          actualPercentage: 20,
          status: TaskStatus.COMPLETED,
          plannedHours: 3,
          spentHours: 3,
          deliverable: "Updated auth flow README",
        },
      ],
      achievements: [
        {
          description: "Delivered manager summary cards ahead of schedule.",
          isKeyAchievement: true,
        },
        {
          description: "Closed three API test gaps identified in review.",
          isKeyAchievement: false,
        },
      ],
      blockers: [],
      statusHistory: [
        {
          fromStatus: null,
          toStatus: ReportStatus.DRAFT,
          changedByEmail: "alex.jordan@example.com",
          createdAtOffsetHours: 2,
        },
        {
          fromStatus: ReportStatus.DRAFT,
          toStatus: ReportStatus.SUBMITTED,
          changedByEmail: "alex.jordan@example.com",
          comment: "Submitted for manager review.",
          createdAtOffsetHours: 30,
        },
        {
          fromStatus: ReportStatus.SUBMITTED,
          toStatus: ReportStatus.APPROVED,
          changedByEmail: "sarah.chen@example.com",
          comment: "Looks good. Clear progress and realistic hours.",
          createdAtOffsetHours: 36,
        },
      ],
      versions: [
        {
          versionNumber: 1,
          createdByEmail: "alex.jordan@example.com",
          notes: "Submitted report for manager review.",
          nextWeekTasks: [
            { task: "Start dashboard filter implementation", priority: "HIGH" },
            { task: "Review mobile onboarding mockups", priority: "LOW" },
          ],
          tasks: [
            {
              projectName: "Internal Dashboard",
              taskTypeName: "Development",
              taskName: "Build manager summary cards",
              priority: TaskPriority.HIGH,
              plannedPercentage: 50,
              actualPercentage: 50,
              status: TaskStatus.COMPLETED,
              plannedHours: 10,
              spentHours: 10,
              deliverable: "Summary cards on dashboard home",
            },
            {
              projectName: "API Development",
              taskTypeName: "Testing",
              taskName: "Add integration tests for report endpoints",
              priority: TaskPriority.MEDIUM,
              plannedPercentage: 30,
              actualPercentage: 30,
              status: TaskStatus.COMPLETED,
              plannedHours: 6,
              spentHours: 6,
            },
            {
              projectName: "Mobile Application",
              taskTypeName: "Documentation",
              taskName: "Document mobile auth flow changes",
              priority: TaskPriority.LOW,
              plannedPercentage: 20,
              actualPercentage: 20,
              status: TaskStatus.COMPLETED,
              plannedHours: 3,
              spentHours: 3,
              deliverable: "Updated auth flow README",
            },
          ],
          achievements: [
            {
              description: "Delivered manager summary cards ahead of schedule.",
              isKeyAchievement: true,
            },
            {
              description: "Closed three API test gaps identified in review.",
              isKeyAchievement: false,
            },
          ],
          blockers: [],
          createdAtOffsetHours: 30,
        },
      ],
      reviews: [
        {
          versionNumber: 1,
          reviewerEmail: "sarah.chen@example.com",
          action: ReviewAction.APPROVE,
          comment: "Looks good. Clear progress and realistic hours.",
          createdAtOffsetHours: 36,
        },
      ],
    },
    {
      userEmail: "casey.nguyen@example.com",
      weekStart: "2026-09-01",
      status: ReportStatus.SUBMITTED,
      notes: "Submitted and awaiting manager review.",
      nextWeekTasks: [
        { task: "Finalize API integration", priority: "HIGH" },
        { task: "Prepare staging deployment checklist", priority: "MEDIUM" },
      ],
      tasks: [
        {
          projectName: "API Development",
          taskTypeName: "Development",
          taskName: "Implement report submission endpoints",
          priority: TaskPriority.HIGH,
          plannedPercentage: 45,
          actualPercentage: 45,
          status: TaskStatus.COMPLETED,
          plannedHours: 14,
          spentHours: 14,
          deliverable: "POST /reports/:id/submit endpoint",
        },
        {
          projectName: "API Development",
          taskTypeName: "Testing",
          taskName: "Add workflow transition tests",
          priority: TaskPriority.MEDIUM,
          plannedPercentage: 35,
          actualPercentage: 30,
          status: TaskStatus.IN_PROGRESS,
          plannedHours: 8,
          spentHours: 7,
        },
        {
          projectName: "Internal Dashboard",
          taskTypeName: "Meetings",
          taskName: "Sprint planning and estimation",
          priority: TaskPriority.LOW,
          plannedPercentage: 20,
          actualPercentage: 20,
          status: TaskStatus.COMPLETED,
          plannedHours: 2,
          spentHours: 2,
        },
      ],
      achievements: [
        {
          description: "Completed submission workflow API with validation coverage.",
          isKeyAchievement: true,
        },
      ],
      blockers: [
        {
          description: "Staging environment credentials pending from DevOps.",
          isKeyIssue: false,
        },
      ],
      statusHistory: [
        {
          fromStatus: null,
          toStatus: ReportStatus.DRAFT,
          changedByEmail: "casey.nguyen@example.com",
          createdAtOffsetHours: 1,
        },
        {
          fromStatus: ReportStatus.DRAFT,
          toStatus: ReportStatus.SUBMITTED,
          changedByEmail: "casey.nguyen@example.com",
          comment: "Ready for review.",
          createdAtOffsetHours: 28,
        },
      ],
      versions: [
        {
          versionNumber: 1,
          createdByEmail: "casey.nguyen@example.com",
          notes: "Initial submission for manager review.",
          nextWeekTasks: [
            { task: "Finalize API integration", priority: "HIGH" },
            { task: "Prepare staging deployment checklist", priority: "MEDIUM" },
          ],
          tasks: [
            {
              projectName: "API Development",
              taskTypeName: "Development",
              taskName: "Implement report submission endpoints",
              priority: TaskPriority.HIGH,
              plannedPercentage: 45,
              actualPercentage: 45,
              status: TaskStatus.COMPLETED,
              plannedHours: 14,
              spentHours: 14,
              deliverable: "POST /reports/:id/submit endpoint",
            },
            {
              projectName: "API Development",
              taskTypeName: "Testing",
              taskName: "Add workflow transition tests",
              priority: TaskPriority.MEDIUM,
              plannedPercentage: 35,
              actualPercentage: 30,
              status: TaskStatus.IN_PROGRESS,
              plannedHours: 8,
              spentHours: 7,
            },
            {
              projectName: "Internal Dashboard",
              taskTypeName: "Meetings",
              taskName: "Sprint planning and estimation",
              priority: TaskPriority.LOW,
              plannedPercentage: 20,
              actualPercentage: 20,
              status: TaskStatus.COMPLETED,
              plannedHours: 2,
              spentHours: 2,
            },
          ],
          achievements: [
            {
              description: "Completed submission workflow API with validation coverage.",
              isKeyAchievement: true,
            },
          ],
          blockers: [
            {
              description: "Staging environment credentials pending from DevOps.",
              isKeyIssue: false,
            },
          ],
          createdAtOffsetHours: 28,
        },
      ],
    },
    {
      userEmail: "riley.patel@example.com",
      weekStart: "2026-09-01",
      status: ReportStatus.NEEDS_CORRECTION,
      notes: "Manager requested clearer blocker impact and updated hour estimates.",
      nextWeekTasks: [
        { task: "Resolve design review feedback", priority: "HIGH" },
        { task: "Update homepage hero section copy", priority: "MEDIUM" },
      ],
      tasks: [
        {
          projectName: "Website Redesign",
          taskTypeName: "Development",
          taskName: "Implement responsive navigation",
          priority: TaskPriority.HIGH,
          plannedPercentage: 40,
          actualPercentage: 40,
          status: TaskStatus.COMPLETED,
          plannedHours: 10,
          spentHours: 10,
          deliverable: "Responsive nav component",
        },
        {
          projectName: "Website Redesign",
          taskTypeName: "Testing",
          taskName: "Cross-browser QA for landing pages",
          priority: TaskPriority.MEDIUM,
          plannedPercentage: 35,
          actualPercentage: 25,
          status: TaskStatus.IN_PROGRESS,
          plannedHours: 8,
          spentHours: 6,
        },
        {
          projectName: "Website Redesign",
          taskTypeName: "Meetings",
          taskName: "Design review with marketing",
          priority: TaskPriority.LOW,
          plannedPercentage: 25,
          actualPercentage: 25,
          status: TaskStatus.COMPLETED,
          plannedHours: 2,
          spentHours: 2,
        },
      ],
      achievements: [
        {
          description: "Shipped responsive navigation to staging.",
          isKeyAchievement: true,
        },
        {
          description: "Documented browser support matrix for QA.",
          isKeyAchievement: false,
        },
      ],
      blockers: [
        {
          description: "Final brand assets delayed from marketing team.",
          isKeyIssue: true,
        },
        {
          description: "Safari flexbox issue under investigation.",
          isKeyIssue: false,
        },
      ],
      statusHistory: [
        {
          fromStatus: null,
          toStatus: ReportStatus.DRAFT,
          changedByEmail: "riley.patel@example.com",
          createdAtOffsetHours: 1,
        },
        {
          fromStatus: ReportStatus.DRAFT,
          toStatus: ReportStatus.SUBMITTED,
          changedByEmail: "riley.patel@example.com",
          createdAtOffsetHours: 26,
        },
        {
          fromStatus: ReportStatus.SUBMITTED,
          toStatus: ReportStatus.NEEDS_CORRECTION,
          changedByEmail: "sarah.chen@example.com",
          comment: "Please clarify blocker impact on delivery and revise QA hour estimates.",
          createdAtOffsetHours: 34,
        },
      ],
      versions: [
        {
          versionNumber: 1,
          createdByEmail: "riley.patel@example.com",
          notes: "Initial submission before correction request.",
          nextWeekTasks: [
            { task: "Resolve design review feedback", priority: "HIGH" },
            { task: "Update homepage hero section copy", priority: "MEDIUM" },
          ],
          tasks: [
            {
              projectName: "Website Redesign",
              taskTypeName: "Development",
              taskName: "Implement responsive navigation",
              priority: TaskPriority.HIGH,
              plannedPercentage: 40,
              actualPercentage: 40,
              status: TaskStatus.COMPLETED,
              plannedHours: 10,
              spentHours: 10,
              deliverable: "Responsive nav component",
            },
            {
              projectName: "Website Redesign",
              taskTypeName: "Testing",
              taskName: "Cross-browser QA for landing pages",
              priority: TaskPriority.MEDIUM,
              plannedPercentage: 35,
              actualPercentage: 20,
              status: TaskStatus.IN_PROGRESS,
              plannedHours: 8,
              spentHours: 5,
            },
            {
              projectName: "Website Redesign",
              taskTypeName: "Meetings",
              taskName: "Design review with marketing",
              priority: TaskPriority.LOW,
              plannedPercentage: 25,
              actualPercentage: 25,
              status: TaskStatus.COMPLETED,
              plannedHours: 2,
              spentHours: 2,
            },
          ],
          achievements: [
            {
              description: "Shipped responsive navigation to staging.",
              isKeyAchievement: true,
            },
          ],
          blockers: [
            {
              description: "Final brand assets delayed from marketing team.",
              isKeyIssue: true,
            },
          ],
          createdAtOffsetHours: 26,
        },
      ],
      reviews: [
        {
          versionNumber: 1,
          reviewerEmail: "sarah.chen@example.com",
          action: ReviewAction.REQUEST_CORRECTION,
          comment: "Please clarify blocker impact on delivery and revise QA hour estimates.",
          createdAtOffsetHours: 34,
        },
      ],
    },
    {
      userEmail: "morgan.lee@example.com",
      weekStart: "2026-08-18",
      status: ReportStatus.APPROVED,
      notes: "Corrected and approved after a full review cycle.",
      nextWeekTasks: [
        { task: "Integrate push notification service", priority: "HIGH" },
        { task: "Add offline mode spike", priority: "MEDIUM" },
      ],
      tasks: [
        {
          projectName: "Mobile Application",
          taskTypeName: "Development",
          taskName: "Implement biometric login flow",
          priority: TaskPriority.HIGH,
          plannedPercentage: 50,
          actualPercentage: 50,
          status: TaskStatus.COMPLETED,
          plannedHours: 12,
          spentHours: 12,
          deliverable: "Biometric login on iOS and Android",
        },
        {
          projectName: "Mobile Application",
          taskTypeName: "Testing",
          taskName: "Device compatibility testing",
          priority: TaskPriority.MEDIUM,
          plannedPercentage: 30,
          actualPercentage: 28,
          status: TaskStatus.COMPLETED,
          plannedHours: 8,
          spentHours: 7.5,
          deliverable: "Device test matrix results",
        },
        {
          projectName: "API Development",
          taskTypeName: "Documentation",
          taskName: "Update mobile auth API docs",
          priority: TaskPriority.LOW,
          plannedPercentage: 20,
          actualPercentage: 20,
          status: TaskStatus.COMPLETED,
          plannedHours: 3,
          spentHours: 3,
        },
      ],
      achievements: [
        {
          description: "Delivered biometric login across both mobile platforms.",
          isKeyAchievement: true,
        },
        {
          description: "Reduced auth-related crash reports by 18% in beta.",
          isKeyAchievement: false,
        },
      ],
      blockers: [
        {
          description: "Legacy Android device required additional QA time.",
          isKeyIssue: false,
        },
      ],
      statusHistory: [
        {
          fromStatus: null,
          toStatus: ReportStatus.DRAFT,
          changedByEmail: "morgan.lee@example.com",
          createdAtOffsetHours: 1,
        },
        {
          fromStatus: ReportStatus.DRAFT,
          toStatus: ReportStatus.SUBMITTED,
          changedByEmail: "morgan.lee@example.com",
          createdAtOffsetHours: 24,
        },
        {
          fromStatus: ReportStatus.SUBMITTED,
          toStatus: ReportStatus.NEEDS_CORRECTION,
          changedByEmail: "sarah.chen@example.com",
          comment: "Please add deliverables for testing tasks and expand blocker details.",
          createdAtOffsetHours: 30,
        },
        {
          fromStatus: ReportStatus.NEEDS_CORRECTION,
          toStatus: ReportStatus.SUBMITTED,
          changedByEmail: "morgan.lee@example.com",
          comment: "Corrections applied and resubmitted.",
          createdAtOffsetHours: 40,
        },
        {
          fromStatus: ReportStatus.SUBMITTED,
          toStatus: ReportStatus.APPROVED,
          changedByEmail: "sarah.chen@example.com",
          comment: "Corrections look good. Approved.",
          createdAtOffsetHours: 46,
        },
      ],
      versions: [
        {
          versionNumber: 1,
          createdByEmail: "morgan.lee@example.com",
          notes: "Initial submission missing detailed testing deliverables.",
          nextWeekTasks: [
            { task: "Integrate push notification service", priority: "HIGH" },
          ],
          tasks: [
            {
              projectName: "Mobile Application",
              taskTypeName: "Development",
              taskName: "Implement biometric login flow",
              priority: TaskPriority.HIGH,
              plannedPercentage: 50,
              actualPercentage: 50,
              status: TaskStatus.COMPLETED,
              plannedHours: 12,
              spentHours: 12,
              deliverable: "Biometric login on iOS and Android",
            },
            {
              projectName: "Mobile Application",
              taskTypeName: "Testing",
              taskName: "Device compatibility testing",
              priority: TaskPriority.MEDIUM,
              plannedPercentage: 30,
              actualPercentage: 25,
              status: TaskStatus.COMPLETED,
              plannedHours: 8,
              spentHours: 7,
            },
            {
              projectName: "API Development",
              taskTypeName: "Documentation",
              taskName: "Update mobile auth API docs",
              priority: TaskPriority.LOW,
              plannedPercentage: 20,
              actualPercentage: 20,
              status: TaskStatus.COMPLETED,
              plannedHours: 3,
              spentHours: 3,
            },
          ],
          achievements: [
            {
              description: "Delivered biometric login across both mobile platforms.",
              isKeyAchievement: true,
            },
          ],
          blockers: [
            {
              description: "Legacy Android device issues.",
              isKeyIssue: false,
            },
          ],
          createdAtOffsetHours: 24,
        },
        {
          versionNumber: 2,
          createdByEmail: "morgan.lee@example.com",
          notes: "Resubmitted with expanded testing deliverables and blocker context.",
          nextWeekTasks: [
            { task: "Integrate push notification service", priority: "HIGH" },
            { task: "Add offline mode spike", priority: "MEDIUM" },
          ],
          tasks: [
            {
              projectName: "Mobile Application",
              taskTypeName: "Development",
              taskName: "Implement biometric login flow",
              priority: TaskPriority.HIGH,
              plannedPercentage: 50,
              actualPercentage: 50,
              status: TaskStatus.COMPLETED,
              plannedHours: 12,
              spentHours: 12,
              deliverable: "Biometric login on iOS and Android",
            },
            {
              projectName: "Mobile Application",
              taskTypeName: "Testing",
              taskName: "Device compatibility testing",
              priority: TaskPriority.MEDIUM,
              plannedPercentage: 30,
              actualPercentage: 28,
              status: TaskStatus.COMPLETED,
              plannedHours: 8,
              spentHours: 7.5,
              deliverable: "Device test matrix results",
            },
            {
              projectName: "API Development",
              taskTypeName: "Documentation",
              taskName: "Update mobile auth API docs",
              priority: TaskPriority.LOW,
              plannedPercentage: 20,
              actualPercentage: 20,
              status: TaskStatus.COMPLETED,
              plannedHours: 3,
              spentHours: 3,
            },
          ],
          achievements: [
            {
              description: "Delivered biometric login across both mobile platforms.",
              isKeyAchievement: true,
            },
            {
              description: "Reduced auth-related crash reports by 18% in beta.",
              isKeyAchievement: false,
            },
          ],
          blockers: [
            {
              description: "Legacy Android device required additional QA time.",
              isKeyIssue: false,
            },
          ],
          createdAtOffsetHours: 40,
        },
      ],
      reviews: [
        {
          versionNumber: 1,
          reviewerEmail: "sarah.chen@example.com",
          action: ReviewAction.REQUEST_CORRECTION,
          comment: "Please add deliverables for testing tasks and expand blocker details.",
          createdAtOffsetHours: 30,
        },
        {
          versionNumber: 2,
          reviewerEmail: "sarah.chen@example.com",
          action: ReviewAction.APPROVE,
          comment: "Corrections look good. Approved.",
          createdAtOffsetHours: 46,
        },
      ],
    },
    {
      userEmail: "morgan.lee@example.com",
      weekStart: "2026-08-25",
      status: ReportStatus.DRAFT,
      notes: "Early draft for the following week after mobile auth delivery.",
      nextWeekTasks: [{ task: "Prototype offline caching layer", priority: "MEDIUM" }],
      tasks: [
        {
          projectName: "Mobile Application",
          taskTypeName: "Research",
          taskName: "Evaluate offline sync libraries",
          priority: TaskPriority.MEDIUM,
          plannedPercentage: 100,
          actualPercentage: 10,
          status: TaskStatus.IN_PROGRESS,
          plannedHours: 6,
          spentHours: 1,
        },
      ],
      achievements: [],
      blockers: [],
      statusHistory: [
        {
          fromStatus: null,
          toStatus: ReportStatus.DRAFT,
          changedByEmail: "morgan.lee@example.com",
          createdAtOffsetHours: 1,
        },
      ],
    },
  ];
}

async function printSeedSummary() {
  const [
    roleCount,
    userCount,
    projectCount,
    taskTypeCount,
    reportCount,
    reportTaskCount,
    achievementCount,
    blockerCount,
    versionCount,
    reviewCount,
    statusHistoryCount,
  ] = await Promise.all([
    prisma.role.count(),
    prisma.user.count(),
    prisma.project.count(),
    prisma.taskType.count(),
    prisma.report.count(),
    prisma.reportTask.count(),
    prisma.achievement.count(),
    prisma.blocker.count(),
    prisma.reportVersion.count(),
    prisma.reportReview.count(),
    prisma.reportStatusHistory.count(),
  ]);

  console.log("Seed summary:");
  console.log(`  Roles: ${roleCount}`);
  console.log(`  Users: ${userCount}`);
  console.log(`  Projects: ${projectCount}`);
  console.log(`  Task types: ${taskTypeCount}`);
  console.log(`  Reports: ${reportCount}`);
  console.log(`  Report tasks: ${reportTaskCount}`);
  console.log(`  Achievements: ${achievementCount}`);
  console.log(`  Blockers: ${blockerCount}`);
  console.log(`  Report versions: ${versionCount}`);
  console.log(`  Report reviews: ${reviewCount}`);
  console.log(`  Status history entries: ${statusHistoryCount}`);
}

async function main() {
  console.log("Starting database seed...");

  const roles = await seedRoles();
  const users = await seedUsers(roles);
  const projects = await seedProjects();
  const taskTypes = await seedTaskTypes();
  const reportDefinitions = buildReportDefinitions();

  for (const reportDefinition of reportDefinitions) {
    await seedReport(reportDefinition, users, projects, taskTypes);
  }

  await printSeedSummary();
  console.log("Database seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Database seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
