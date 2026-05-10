# Project Memory

## Product Scope

- Current MVP focuses on a JD-driven resume decision assistant, not the full job-search lifecycle.
- The core flow is: experience intake -> JD parsing -> match analysis -> resume generation -> ATS and risk notes.
- Explicitly deferred for now: career positioning, enterprise ranking, interview simulation, and delivery board management.

## Stack And Tooling

- Frontend lives in `web/`.
- Frontend stack: Next.js 16 App Router, TypeScript, Tailwind CSS v4.
- This machine does not have global `node` or `npm`; a local Node.js toolchain is vendored in `.tools/node`.

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

## Current App Surface

- Route skeletons exist for:
  - `/`
  - `/tasks/new`
  - `/tasks/demo/intake`
  - `/tasks/demo/jd`
  - `/tasks/demo/analysis`
  - `/tasks/demo/resume`

## Known Operational Pitfalls

- If `PATH` is overwritten instead of prefixed, `npm` may fail with `spawn sh ENOENT`.
- Use `PATH="...:$PATH"`, not `PATH="..."`.

## Open Architecture Decisions

- Real data persistence method for intake drafts.
- JD analysis API contract shape.
- Resume export implementation path.
- Authentication and user account boundary.
