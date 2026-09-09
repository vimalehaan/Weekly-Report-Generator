# Weekly Report Generator & Team Dashboard

Full-stack web application for structured weekly work reports and manager team dashboards.

## Tech Stack

- **Frontend:** React, TypeScript, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Prisma — to be added in a later phase)
- **Validation:** Zod (to be added in a later phase)
- **Authentication:** JWT with HTTP-only cookies (to be added in a later phase)
- **Testing:** Jest + Supertest (to be added in a later phase)

## Project Structure

```
weekly-report-generator/
├── frontend/          # React + TypeScript + Vite app
├── backend/           # Node.js + Express + TypeScript API
├── docs/              # Architecture, database, API, and screenshot docs
├── package.json       # Root workspace scripts
└── README.md
```

## Prerequisites

- Node.js 20+
- npm 10+

## Setup

Install dependencies for all workspaces from the repository root:

```bash
npm install
```

Copy the backend environment example file and adjust values if needed:

```bash
cp backend/.env.example backend/.env
```

## Development

Run the frontend dev server:

```bash
npm run dev:frontend
```

Run the backend dev server:

```bash
npm run dev:backend
```

By default:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Build

```bash
npm run build
```

Build individual workspaces:

```bash
npm run build:frontend
npm run build:backend
```
