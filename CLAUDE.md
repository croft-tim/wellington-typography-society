# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                  # Install dependencies
npm run dev                  # Run frontend (port 5173) and backend (port 3000) concurrently
npm run dev:client           # Vite dev server only
npm run dev:server           # Express server only (tsx watch)
npm run build                # Build both client (Vite) and server (esbuild → dist/server.js)
npm start                    # Run production build
npm test -- --run            # Run tests once (Vitest + @testing-library/react)
npm test -- --run <pattern>  # Run a single test file, e.g. npm test -- --run locations
npm run lint                 # ESLint across .js/.jsx/.ts/.tsx
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
- **`server/routes/`** — Express route handlers
- **`server/db/`** — Knex connection, per-resource query functions, migrations, seeds
- **`models/`** — Shared TypeScript interfaces used by both client and server

### Route prefixes

The actual game routes use `/api/` (not `/api/v1/`). The fruit boilerplate remains on `/api/v1/fruits`. New routes should follow the game convention:
- `POST /api/auth/signup|login|logout`, `GET /api/auth/me`
- `POST /api/scan/:token`
- `GET /api/locations/:slug`
- `POST /api/riddles/:exitId/attempt`

### Application: Wellington Typography Society

This is a **location-based game** set in Wellington's Te Aro neighbourhood. Players scan physical QR codes placed at real-world intersections to unlock locations and explore a text-adventure-style map.

**Game mechanics:**
1. Player scans a QR code at a physical location → `POST /api/scan/:token` → records visit, returns the location's `slug`
2. Client navigates to `/location/:slug` → `GET /api/locations/:slug` → returns location data + exits
3. Location access is gated: a 403 is returned if the player hasn't scanned in at that location
4. Exits can be locked (`is_locked: true`) and require solving a riddle → `POST /api/riddles/:exitId/attempt`
5. A correct answer inserts a row into `player_unlocked_exits`, making the exit traversable

**Game map:** A 3×3 grid of Wellington street intersections (Taranaki/Tory/Cuba columns × Dixon/Leeds/Ghuznee rows). `leeds-cuba` is the starting node. One locked exit: `leeds-cuba → ghuznee-cuba` (south), guarded by a riddle.

### Database schema (game tables)

```
locations           — slug, name, description, grid_x, grid_y
location_tokens     — token (UUID per QR code) → location_id
exits               — from/to location_id, direction, is_locked
riddles             — exit_id, question, answer, hint, failure_message
users               — username, email, password_hash
player_progress     — user_id, current_location_id
player_visited_locations — user_id, location_id
player_unlocked_exits    — user_id, exit_id
```

### Authentication

Session-based auth via `express-session`. The `isAuthenticated` middleware (`server/middleware/isAuthenticated.ts`) checks `req.session.userId` and returns 401 if absent. All game routes (scan, locations, riddles) require authentication.

### Testing patterns

There are two testing approaches used in this project:

1. **DB-layer tests** (`server/tests/locations.test.ts`, `riddles.test.ts`): Use an isolated in-memory SQLite database via `server/tests/helpers.ts`. Call `setupTestDb` / `teardownTestDb` in `beforeAll`/`afterAll`. Insert test data inline using TypeScript (do not use `db.seed.run()`).

2. **Route tests** (`server/tests/locations-route.test.ts`, `auth.test.ts`, `scan.test.ts`): Import the real `server.ts` app and use `supertest` with `request.agent(app)` to maintain session cookies across requests. Insert test data directly via `appDb` in `beforeAll`.

## PromptKit

This is a Dev Academy learning project. Student notes are in `promptkit/notes/progress-journal.md`. Instructor activities are in `promptkit/activities/` (read-only). Workflows for tutoring and reflection sessions live in `promptkit/workflows/`.
