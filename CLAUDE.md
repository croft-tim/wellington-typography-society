# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install           # Install dependencies
npm run dev           # Run frontend (port 5173) and backend (port 3000) concurrently
npm run dev:client    # Vite dev server only
npm run dev:server    # Express server only (tsx watch)
npm run build         # Build both client (Vite) and server (esbuild → dist/server.js)
npm start             # Run production build
npm test -- --run     # Run tests once (Vitest + @testing-library/react)
npm test              # Run tests in watch mode
npm run lint          # ESLint across .js/.jsx/.ts/.tsx
npm run knex migrate:latest  # Run database migrations
npm run knex seed:run        # Run database seeds
```

## Architecture

**Full-stack TypeScript** with React frontend, Express backend, and SQLite database (Knex).

### Request flow

```
Browser → Vite (dev proxy /api → :3000) → Express routes → Knex queries → SQLite
```

In production, Express serves the Vite-built SPA from `dist/public/` and handles API routes.

### Key layers

- **`client/apis/`** — Superagent HTTP clients (one file per resource)
- **`client/hooks/`** — React Query hooks wrapping the API clients (`useQuery` + mutations)
- **`client/components/`** — React components consuming the hooks
- **`server/routes/`** — Express route handlers (mounted under `/api/v1/`)
- **`server/db/`** — Knex connection, per-resource query functions, migrations, seeds
- **`models/`** — Shared TypeScript interfaces used by both client and server

### Data flow example (fruits)

`useFruits` hook → `client/apis/fruits.ts` → `GET /api/v1/fruits` → `server/routes/fruits.ts` → `server/db/fruits.ts` → SQLite `fruit` table

## PromptKit

This is a Dev Academy learning project. Student notes are in `promptkit/notes/progress-journal.md`. Instructor activities are in `promptkit/activities/` (read-only). Workflows for tutoring and reflection sessions live in `promptkit/workflows/`.
