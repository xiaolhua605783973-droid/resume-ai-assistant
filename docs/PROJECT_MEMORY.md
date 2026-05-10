# Project Memory

## Product Scope

- Current MVP focuses on a JD-driven resume decision assistant, not the full job-search lifecycle.
- The core flow is: experience intake -> JD parsing -> match analysis -> resume generation -> ATS and risk notes.
- Explicitly deferred for now: career positioning, enterprise ranking, interview simulation, and delivery board management.

## Stack And Tooling

- Frontend lives in `web/`.
- Frontend stack: Next.js 16 App Router, TypeScript, Tailwind CSS v4.
- This machine does not have global `node` or `npm`; a local Node.js toolchain is vendored in `.tools/node`.
- Current MVP task persistence is backend JSON file storage under `web/.data/tasks`.
- Resume import parsing currently uses `mammoth` for DOCX and `pdf-parse` for PDF.
- External JD/match/resume analysis now supports an OpenAI-compatible Chat Completions endpoint via environment variables.

## Validated Local Commands

- From repo root, prepend local Node path when needed: `PATH="$PWD/.tools/node/bin:$PATH"`.
- In `web/`, validated commands are:
  - `npm run lint`
  - `npm run build`
- A VS Code task exists to run the dev server locally.

## Repository Conventions

- `AGENTS.md` is the canonical workflow contract for all agents.
- `docs/DEVELOPMENT_STATUS.md` is the execution log and first handoff file.
- Every meaningful bug fix must be recorded in the development status bug log.
- Keep commits scoped and descriptive.
- The repository has been initialized with git on the `main` branch.
- `web/` is tracked as normal source files in the root repository, not as a submodule or nested git repository.

## Current App Surface

- Route skeletons exist for:
  - `/`
  - `/tasks/new`
  - `/tasks/demo/intake`
  - `/tasks/demo/jd`
  - `/tasks/demo/analysis`
  - `/tasks/demo/resume`
- The demo task routes are now functional pages backed by server-created `taskId` records, backend draft persistence, server-side deterministic analysis, resume parsing upload, and editable resume output.

## Backend Boundaries

- Task APIs live under `web/src/app/api/tasks`.
- Task records are persisted through `web/src/server/task-repository.ts`.
- Resume file extraction and heuristic field mapping live in `web/src/server/resume-parser.ts`.
- External analysis orchestration lives in `web/src/server/external-analysis.ts`.
- Client pages should call `web/src/lib/mvp-api.ts` instead of importing deterministic analysis helpers directly.

## External Analysis Config

- External analysis env vars are `ANALYSIS_API_BASE_URL`, `ANALYSIS_API_KEY`, `ANALYSIS_API_MODEL`, and optional `ANALYSIS_API_PATH`.
- The provider contract is OpenAI-compatible `chat/completions`.
- DeepSeek has been live-validated against this contract with `https://api.deepseek.com` and `/chat/completions`; the last verified model was `deepseek-v4-flash`.
- If those env vars are missing, the analyze route falls back to the local deterministic engine so local development still works.

## Known Operational Pitfalls

- If `PATH` is overwritten instead of prefixed, `npm` may fail with `spawn sh ENOENT`.
- Use `PATH="...:$PATH"`, not `PATH="..."`.
- `create-next-app` may create its own `.git` directory inside `web/`; remove `web/.git` before committing the root repository, otherwise `web` is stored as a gitlink instead of normal source files.
- In Next.js App Router, pages using `useSearchParams` need a `Suspense` boundary to pass production build prerender checks.
- External analysis returns free-form model text; always normalize and validate provider JSON before persisting it into task records.

## Open Architecture Decisions

- Real-provider choice and deployment-time secret management for external analysis.
- Resume export implementation path.
- Authentication and user account boundary.
