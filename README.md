# Weekly Report Generator & Team Dashboard

Full-stack web application for structured weekly work reports, manager review workflows, and team performance dashboards.

## Project overview

Team members create and submit weekly reports that capture tasks, achievements, blockers, and plans for the next week. Managers review submitted reports, request corrections, approve reports, and manage team catalog data (users, projects, task types). The system supports report versioning, review history, and status history through the full lifecycle:

**DRAFT → SUBMITTED → NEEDS_CORRECTION → SUBMITTED → APPROVED**

### Roles

| Role | Capabilities |
|------|----------------|
| **Team Member** | Own reports (create, draft, edit, submit, resubmit), dashboard, report history, version snapshots |
| **Manager** | Team reports and review actions, manager dashboard, user management, projects, task types |

New accounts registered through the UI are created as **Team Member** only.

## Technology and architecture

| Layer | Stack |
|-------|--------|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, React Hook Form, Zod, Recharts |
| Backend | Node.js, Express, TypeScript, Zod validation, JWT in HTTP-only cookies |
| Database | PostgreSQL via Prisma ORM |
| Backend tests | Jest, Supertest |
| Browser QA | Playwright (scripts in `scripts/`) |

**Request flow (frontend):**

Pages and components → domain services under `frontend/src/services/` → `apiRequest()` in `frontend/src/services/api/client.ts` (credentials included) → REST API at `/api/v1/*` → Express controllers → services → Prisma → PostgreSQL.

The backend enforces authentication, authorization, validation, and report workflow rules. The frontend provides UX and client-side validation only.

## Project structure

```
weekly-report-generator/
├── frontend/                 # React SPA
│   └── src/
│       ├── pages/            # Route-level pages (auth, member, manager)
│       ├── components/       # Reusable UI and feature components
│       ├── services/         # API client and domain API modules
│       ├── routes/           # Router, paths, route guards
│       ├── contexts/         # Auth session context
│       ├── hooks/            # Shared hooks (e.g. report catalog)
│       ├── schemas/          # Zod form schemas
│       ├── types/            # TypeScript types
│       └── utils/            # Helpers (dates, workflow, API errors)
├── backend/
│   ├── src/                  # Express app, routes, controllers, services, middleware
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── migrations/       # SQL migrations
│   │   └── seed.ts           # Development seed data
│   └── tests/                # Jest integration tests
├── scripts/                  # Playwright QA scripts (qa-6.1 … qa-6.4)
├── package.json              # npm workspaces (frontend + backend)
└── README.md
```

## Prerequisites

- **Node.js** 20+ (project tested with current LTS-style versions)
- **npm** 10+ (workspaces)
- **PostgreSQL** running locally (or reachable via `DATABASE_URL`)
- **Playwright Chromium** (only for QA scripts): `npx playwright install chromium` from the `frontend` workspace

## Environment variables

Copy example files and adjust for your machine. Do not commit real secrets.

### Backend (`backend/.env`)

Create from `backend/.env.example`:

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default `3000`) |
| `NODE_ENV` | e.g. `development` or `production` |
| `FRONTEND_URL` | Browser origin for CORS (default `http://localhost:5173`) |
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `JWT_SECRET` | Secret for signing access tokens (use a strong value outside local dev) |
| `JWT_EXPIRES_IN` | Token lifetime (example: `1h`) |

### Frontend (`frontend/.env`)

Create from `frontend/.env.example`:

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` | Backend origin, no trailing slash (default `http://localhost:3000`) |

## Installation

From the repository root:

```bash
npm install
```

## Database setup

Ensure PostgreSQL is running and `DATABASE_URL` in `backend/.env` points to your database.

From the repository root (or `backend/` workspace):

```bash
npm run db:generate --workspace=backend
npm run db:migrate --workspace=backend
```

Other useful backend database commands:

```bash
npm run db:validate --workspace=backend
npm run db:seed --workspace=backend
```

Integration tests use a separate test database configured in the backend test setup (`backend/tests/setup/`).

## Seed data

Seed the development database:

```bash
npm run db:seed --workspace=backend
```

The seed defines a shared development password constant in `backend/prisma/seed.ts` (`SEED_PASSWORD`). All seeded users use that password. The same value is used by the Playwright QA scripts.

### Seeded accounts

| Email | Role |
|-------|------|
| `sarah.chen@example.com` | Manager |
| `alex.jordan@example.com` | Team Member |
| `morgan.lee@example.com` | Team Member |
| `riley.patel@example.com` | Team Member |
| `casey.nguyen@example.com` | Team Member |

**Development password:** `Password123!` (defined in seed and QA scripts; change only for non-local environments.)

The seed also creates sample projects, task types, and reports in various workflow states for demos and QA.

## Running the application

Start the backend and frontend in separate terminals from the repository root:

```bash
npm run dev:backend
npm run dev:frontend
```

Default URLs:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3000](http://localhost:3000)
- Health check: [http://localhost:3000/health](http://localhost:3000/health)

## Main application routes

Paths match `frontend/src/routes/paths.ts` and `frontend/src/routes/router.tsx`.

### Authentication (public)

| Path | Description |
|------|-------------|
| `/login` | Sign in |
| `/register` | Register as team member |

### Team member

| Path | Description |
|------|-------------|
| `/member/dashboard` | Member dashboard |
| `/member/reports` | My reports list |
| `/member/reports/new` | Create report |
| `/member/reports/:reportId` | Report detail / edit / submit |
| `/member/reports/history` | Report history |
| `/member/reports/:reportId/versions` | Version list |
| `/member/reports/:reportId/versions/:versionNumber` | Version snapshot |

### Manager

| Path | Description |
|------|-------------|
| `/manager/dashboard` | Manager dashboard and charts |
| `/manager/reports` | Team reports |
| `/manager/reports/:reportId` | Review, approve, request correction, comments, history |
| `/manager/review` | Review hub (links to team reports) |
| `/manager/users` | User list |
| `/manager/users/:userId` | User detail / activate / deactivate |
| `/manager/projects` | Project list |
| `/manager/projects/new` | Create project |
| `/manager/projects/:projectId` | Project detail / edit / deactivate |
| `/manager/task-types` | Task type list |
| `/manager/task-types/new` | Create task type |
| `/manager/task-types/:taskTypeId` | Task type detail / edit / deactivate |

After sign-in, `/` redirects to the role-appropriate dashboard.

Unknown URLs show a **404** page when matched by the public or authenticated catch-all routes (see `NotFoundPage`).

## Testing and verification

There is **no frontend unit test suite** in this repository. Verification is via lint, builds, backend integration tests, and optional Playwright QA scripts.

From the repository root:

```bash
npm run lint --workspace=frontend
npm run build --workspace=frontend
npm run build --workspace=backend
CI=1 npm run test --workspace=backend
```

Setting `CI=1` avoids Jest Watchman issues in some environments.

Production preview (frontend):

```bash
npm run preview --workspace=frontend
```

## QA scripts (Playwright)

Requires **frontend** on port **5173** and **backend** on port **3000**, seeded database, and Chromium installed (`npx playwright install chromium` from `frontend/`).

| Script | Focus |
|--------|--------|
| `scripts/qa-6.1-auth.mjs` | Login, logout, RBAC route protection, `state.from`, forbidden banner |
| `scripts/qa-6.2-reports.mjs` | Member report create, draft, submit, detail, history |
| `scripts/qa-6.3-manager.mjs` | Manager review, approve, correction, team reports |
| `scripts/qa-6.4-integration.mjs` | Cross-role integration, lifecycle, dashboard, catalog, errors, responsive checks |

Run from the `frontend` directory (Playwright is a devDependency of `frontend`):

```bash
cd frontend
node ../scripts/qa-6.1-auth.mjs
node ../scripts/qa-6.2-reports.mjs
node ../scripts/qa-6.3-manager.mjs
node ../scripts/qa-6.4-integration.mjs
```

Optional environment overrides used by some scripts:

- `QA_FRONTEND_URL` (default `http://localhost:5173`)
- `QA_API_URL` (default `http://localhost:3000`)

Re-running QA may **skip** steps when seed data no longer matches preconditions (e.g. a report already approved). Re-seed if you need a clean demo state.

## Known limitations

- **Member dashboard metrics** are computed from at most the first 100 reports returned by the list API; a footnote appears when the member has more reports than loaded.
- **Session expiry UX:** protected API `401` responses clear client auth state and redirect to sign-in via route guards; individual requests may still surface a brief inline error before redirect.
- **Frontend lint:** oxlint may report React Fast Refresh and `set-state-in-effect` warnings; builds still succeed.
- **Frontend bundle size:** production build may warn about a large JS chunk (Recharts and app code); no code-splitting milestone was applied.
- **Deactivated users:** login is blocked for inactive accounts; an existing session cookie is rejected on the next protected API request (`401`, cookie cleared server-side).
- **Development database:** QA and manual testing can mutate report states; use `db:seed` to restore predictable demo data.

## Build (production artifacts)

```bash
npm run build
```

Or per workspace:

```bash
npm run build:frontend
npm run build:backend
```

Backend start after build:

```bash
npm run start --workspace=backend
```

Ensure production environment variables and a migrated database are configured before deploying.
