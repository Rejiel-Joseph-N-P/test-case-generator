# Test Case Generator

A full-stack app that turns software requirements or user stories into structured test cases using AI. Users can review, edit, regenerate, save and export the results.

**Live app:** https://test-case-generator-amber.vercel.app/
**API health check:** https://test-case-generator-wgir.onrender.com/api/health

> The backend runs on Render's free tier and sleeps after inactivity, so the first request can take up to a minute.

## Features

- Paste requirements and generate test cases covering positive, negative, edge-case and validation scenarios
- View cases with category and priority badges, filter by category
- Edit or delete individual test cases
- Regenerate with optional guidance (e.g. "focus on security")
- Save projects, which persist across refreshes and appear in the sidebar
- Export test cases to CSV
- Responsive layout (sidebar collapses on mobile)

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, TanStack Query |
| Backend | Node.js, Express 5, TypeScript, Zod |
| Database | PostgreSQL (Neon) with Prisma ORM |
| AI | Google Gemini API (model configurable via env var) |
| Hosting | Vercel (frontend), Render (backend), Neon (database) |

## Running locally

Prerequisites: Node.js 20+, a PostgreSQL database (for example a free Neon project) and a Gemini API key from Google AI Studio.

```bash
git clone https://github.com/Rejiel-Joseph-N-P/test-case-generator.git
cd test-case-generator

# Backend
cd server
npm install
cp .env.example .env        # then fill in your values
npx prisma migrate deploy
npm run dev                 # http://localhost:4000

# Frontend (second terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

On Windows PowerShell use `copy .env.example .env`.

### Environment variables (`server/.env`)

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Gemini API key (never commit this) |
| `GEMINI_MODEL` | Model name, kept in config because model names change often |
| `PORT` | Server port (default 4000) |
| `CLIENT_ORIGIN` | Allowed frontend origin for CORS |

The frontend reads an optional `VITE_API_URL` (defaults to `/api`, which Vite proxies to the backend in development).

## Architecture

```
React client  ->  Express API  ->  PostgreSQL (Prisma)
                      |
                      +-> Gemini API
```

Backend layers, each with a single responsibility:

- `routes` map URLs to controllers and attach validation and rate limiting
- `controllers` are thin and handle HTTP only
- `services` hold business logic (`generation.service`, `ai.service`, ...)
- `schemas` define Zod validation for requests and AI output
- `middleware` provides validation and central error handling
- `config/env.ts` validates environment variables at startup

Frontend: components for UI, `hooks/useApi.ts` for all server communication (TanStack Query handles caching and refetching), `lib/api.ts` as a typed fetch wrapper, and `types` shared across the app.

### Data model

- **Requirement**: id, title, rawText, sourceType, status (`DRAFT` | `SAVED`), timestamps
- **TestCase**: id, requirementId (FK, cascade delete), title, category (`POSITIVE` | `NEGATIVE` | `EDGE_CASE` | `VALIDATION`), priority (`HIGH` | `MEDIUM` | `LOW`), preconditions, steps (JSON array), expectedResult, isEdited, position

One requirement has many test cases. Regenerating replaces a requirement's test cases inside a single database transaction.

### AI integration strategy

- **Prompt engineering:** a system prompt sets a senior-QA role, requires all four categories, limits output size, forbids inventing features not in the requirement, and tells the model to treat the requirement text as data (basic prompt-injection resistance).
- **Structured output:** the request uses JSON mime type plus a response schema. The result is parsed and validated with Zod.
- **Self-correction:** if the output is invalid JSON or fails the schema, one retry sends the validation error back to the model. If that also fails, the user gets a clear error.
- **Failure handling:** transient errors (429, 5xx, network) retry up to 3 times with exponential backoff, then return friendly 429/503 errors. Provider rejections (bad key or model) return a 502.
- **Hallucination and vague input:** the model can return an empty list with an explanation, which the API surfaces as a 422 asking for more detail. Duplicate titles are removed before saving.
- **Cost control:** the generate endpoint is rate limited (5 requests per minute per client).

## Security and robustness

- Secrets live only in environment variables; `.env` is git-ignored and `.env.example` is provided
- The Gemini key is only ever used server-side
- Input validated with Zod on every write endpoint (length limits, enums)
- Helmet security headers, CORS restricted to the configured frontend origin, JSON body size limit
- CSV export neutralizes spreadsheet formula injection
- Central error handler returns consistent JSON errors and never leaks stack traces

## Decisions and trade-offs

- **Express over NestJS:** fastest route to a clean layered structure within the time limit
- **PostgreSQL:** the data is relational (requirement to test cases) and Prisma gives type-safe access
- **Single generation step:** the design reference shows a multi-stage wizard (workflows, rules, stories, test cases); I focused on one reliable requirements-to-test-cases pipeline, per the brief's "functionality over perfection"
- **Configurable model:** model names change frequently, so the model is an env var

## Possible improvements

- `.pdf` / `.txt` document upload on the input screen
- Authentication and per-user projects
- Streaming generation progress
- Automated tests for services and API routes
