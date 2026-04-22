# BuzzIt

BuzzIt is a personal productivity MERN app in a monorepo: **`server/`** (Express + Mongoose + TypeScript) and **`client/`** (Vite + React + TypeScript). The API uses an MVC-style layout: **routes → controllers (thin) → services → Mongoose models**, with **Zod** validating bodies and query strings before controllers run.

## Error JSON (consistent app-wide)

All API errors use this shape:

- **Simple:** `{ "error": string }`
- **Validation (422):** `{ "error": string, "details": { "field": string, "message": string }[] }`

The `details` array is included when request validation fails (Zod).

## Auth

- **JWT** access tokens use **HS256** with `JWT_SECRET`.
- Claims: `sub` = MongoDB user id (string), `username`, `role`, `exp`. If `JWT_ISSUER` / `JWT_AUDIENCE` are set in the environment, they are embedded and enforced on verify.
- **Passwords** are stored with **bcrypt** only (cost factor **12** in code; typical range 10–12).

## Domain enums (numeric in DB and JSON)

| Category | Value |
|----------|------:|
| General  | 0 |
| Work     | 1 |
| Personal | 2 |
| Ideas    | 3 |
| Urgent   | 4 |

| Priority | Value |
|----------|------:|
| Low      | 0 |
| Medium   | 1 |
| High     | 2 |

## Completion rules (`Post` and `Reminder`)

- When **`isCompleted`** becomes `true`, **`completedAt`** is set to “now” if not explicitly provided.
- When **`isCompleted`** becomes `false`, **`completedAt`** is cleared.

## Cascade delete (User → Posts / Reminders)

When a **User** document is deleted, all of that user’s **Posts** and **Reminders** are removed. This is implemented with Mongoose middleware on **`deleteOne` (document)** and **`findOneAndDelete` (query)** on the User model, so both `user.deleteOne()` and `User.findByIdAndDelete(id)` trigger cleanup.

## Idempotent “mark” endpoints

- **`PATCH /api/post/:id/mark-complete`:** If the post is already completed → **204 No Content**. If it transitions to complete → **200** with the updated post body.
- **`PATCH /api/reminders/:id/mark-done`:** Same behavior as posts (already done → **204**; first time → **200** with body).

## Posts API

- **`GET /api/post`** — All posts for the current user, sorted by **`createdAt` descending** (newest first).
- Other routes: get one, create, update (partial body with at least one field), delete, and `mark-complete` as above.

## Reminders API

- **`GET /api/reminders`** — Lists the current user’s reminders with optional query filters:
  - **`search`** — case-insensitive match on **title or description**
  - **`category`**, **`priority`** — numeric enums
  - **`isCompleted`** — `true` / `false`
- **`PATCH /api/reminders/:id/mark-done`** — idempotent behavior documented above.

## Prerequisites

- **Node.js** 20+ recommended
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### MongoDB locally

1. Install MongoDB Community Server or run it via Docker, e.g. `mongodb://127.0.0.1:27017`.
2. Set `MONGODB_URI` (see below) to your connection string, e.g. `mongodb://127.0.0.1:27017/buzzit`.

## Environment

### Server (`server/.env`)

Copy `server/.env.example` to `server/.env` and adjust:

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/buzzit` |
| `PORT` | API port | `4000` |
| `CLIENT_URL` | Allowed browser origin(s) for CORS (comma-separated for multiple) | `http://localhost:5173` or `http://localhost:5173,https://app.example.com` |
| `JWT_SECRET` | HMAC secret for HS256 | long random string |
| `JWT_ISSUER` | Optional JWT `iss` | e.g. `buzzit-api` |
| `JWT_AUDIENCE` | Optional JWT `aud` | e.g. `buzzit-client` |
| `JWT_EXPIRES_IN` | `expiresIn` for `jsonwebtoken` (must align with login/register response) | `15m`, `1h`, `7d` |

The login and register responses include **`expiresInMinutes`**, computed from `JWT_EXPIRES_IN` (via the `ms` package) so it stays aligned with the actual token lifetime.

### Client (`client/.env`)

Copy `client/.env.example` to `client/.env` if you want to override defaults:

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Base URL of the API (no trailing slash). If unset in dev, the Vite dev server can proxy `/api` when configured. | `http://localhost:4000` |

**No secrets** belong in the client bundle.

### Where the JWT is stored (SPA)

- **Key:** `buzzit_access_token` in **`localStorage`**, plus `buzzit_session` (JSON: `username`, `role`) for UI display.
- **Why localStorage:** simple persistence across reloads for a dev-focused SPA; acceptable for this template. For production hardening, consider `httpOnly` cookies and CSRF strategy.

On **401** from the API, the client **clears the session** and **redirects to `/login`**.

## Install & run

From the repo root:

```bash
npm install
```

**Terminal 1 — API**

```bash
npm run dev:server
```

**Terminal 2 — Client**

```bash
npm run dev:client
```

Or run both:

```bash
npm run dev
```

- API: `http://localhost:4000` (or your `PORT`)
- Client: `http://localhost:5173`

### Build

```bash
npm run build
```

Produces `server/dist/` and `client/dist/`.

### Production API

```bash
npm run start
```

Runs `node server/dist/index.js` (after `npm run build -w server`).

## Manual test checklist

1. **Register** a user; confirm **201**-style response includes `accessToken`, `expiresInMinutes`, `username`, `role`.
2. **Login**; confirm **200** and same JSON shape.
3. **Posts:** create → list → get one → update → **PATCH mark-complete** twice (second call **204**) → delete.
4. **Reminders:** create → list with **search / category / priority / isCompleted** filters → update → **PATCH mark-done** twice (second **204**) → delete.

## Project layout (high level)

```
server/src/
  routes/        # Wire HTTP paths to controllers + validators
  controllers/   # HTTP only
  services/      # Business logic
  models/        # Mongoose schemas
  middleware/    # auth, validation, errors
  validators/    # Zod schemas
client/src/
  api/           # Axios instance + calls
  auth/          # Auth context
  pages/         # Screens + forms
```

## API base paths

- `/api/auth` — register, login  
- `/api/post` — posts (JWT required)  
- `/api/reminders` — reminders (JWT required)

See route files under `server/src/routes/` for exact paths and methods.
