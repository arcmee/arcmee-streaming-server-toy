# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds all TypeScript code. `app.ts` wires the Express app, `main.ts` boots HTTP APIs, and `worker.ts` runs BullMQ background jobs.
- Layering: `domain/` defines core models, `application/` contains use-cases, services, and DTOs, while `infrastructure/` provides config, persistence (Prisma/Postgres), storage/media adapters, and web entry points.
- Tests live in `src/e2e/` (integration flows) and `src/tests/fakes/` (test doubles). Built output is emitted to `dist/`. Database schema and migrations sit in `prisma/`.
- Use the `@src/...` path alias from `tsconfig.json` for intra-project imports instead of deep relative paths.

## Build, Test, and Development Commands
- `npm run dev` — start the API in watch mode with ts-node-dev.
- `npm run dev:worker` — run the background worker in watch mode.
- `npm run build` — compile TypeScript to `dist/`.
- `npm start` / `npm run worker` — run the compiled API / worker from `dist/`.
- `npm test` — execute Jest suites in-band.
- Prisma: `npx prisma migrate dev --name <msg>` to evolve the schema; `npx prisma generate` if you change the Prisma schema only.

## Coding Style & Naming Conventions
- TypeScript (strict) with CommonJS modules; prefer async/await and early returns over nested conditionals.
- Use 2-space indentation; keep files focused on a single responsibility. Name files in kebab-case (e.g., `stream.controller.ts`) and classes in PascalCase.
- Keep handlers thin: route/web layers delegate to application use-cases; avoid direct persistence calls from controllers.
- No formatter is configured; align with existing style and add clarifying comments only where logic is non-obvious.

## Testing Guidelines
- Jest is configured via `jest.config.js` with `ts-jest`; tests match `**/__tests__/**/*.test.ts` or `*.{spec,test}.ts`.
- Prefer placing integration scenarios under `src/e2e/` and unit tests alongside features. Reuse fakes in `src/tests/fakes/` to isolate external dependencies.
- Run `npm test` before opening a PR. When adding database-dependent tests, gate them behind predictable fixtures/migrations and avoid mutating shared state.

## Commit & Pull Request Guidelines
- Follow the existing short, imperative commit style (e.g., `Add health endpoint`); keep subject lines under ~72 chars and focus on behavior changes. English or Korean is acceptable per history.
- For PRs: describe scope and motivation, link the related issue/task, list test evidence (`npm test`, manual checks), and note any schema or env changes (e.g., new Prisma migration, env vars).
- Include screenshots or sample responses for API-affecting changes when helpful, and call out breaking changes or operational runbooks (migrations, queue resets, media storage paths).

## Configuration & Security Notes
- Copy `.env.example` to `.env` and fill in `DATABASE_URL`, `REDIS_URL`, JWT secrets, and refresh-token settings before running locally. Do not commit secrets or generated `.env` files.
- Prefer Docker Compose (`docker-compose.yml`) when you need Postgres/Redis quickly. Keep media/storage paths consistent with `infrastructure/media` expectations to avoid runtime errors.
