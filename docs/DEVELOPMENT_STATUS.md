# Development Status

## Project Snapshot

- Last updated: 2026-05-10
- Current phase: Environment ready, workflow scaffolding started
- Current MVP: JD-driven resume decision assistant
- Repo status: workflow docs established, git initialized on `main`, baseline commits created, `web/` tracked normally

## Read First

1. `AGENTS.md`
2. `docs/PROJECT_MEMORY.md`
3. `web/README.md`

## Current Progress

### Completed

- Reworked the product PRD into a narrower MVP focused on JD-driven resume decisions.
- Initialized `web/` with Next.js 16, TypeScript, and Tailwind CSS.
- Added landing page and route skeletons for intake, JD analysis, match analysis, and resume editing.
- Verified local lint and production build with vendored Node.js.
- Added workflow instruction files and project memory files.
- Initialized the git repository on the `main` branch.
- Implemented a functional client-side MVP flow for intake, JD parsing, match analysis, resume generation, editing, and browser PDF export.

### In Progress

- Refining the functional MVP and deciding when to replace client-local storage and deterministic analysis with backend APIs.

### Next Recommended Work

1. Replace browser-local task drafts with persistent backend storage.
2. Replace deterministic local JD analysis with a real API contract and server-side orchestration.
3. Add resume import parsing and task history beyond the single demo task.

## Validation History

### 2026-05-10

- `web`: `npm run lint` passed with local Node path.
- `web`: `npm run build` passed with local Node path.
- `web`: `npm run lint` passed after replacing the nested git repository with normal tracked files.
- `web`: `npm run lint` passed after wiring the client-side MVP flow.
- `web`: `npm run build` passed after wiring the client-side MVP flow.

## Bug Log

| Date | Area | Symptom | Root Cause | Fix Applied | Prevention |
| --- | --- | --- | --- | --- | --- |
| 2026-05-10 | Local tooling | `npm run lint` failed with `spawn sh ENOENT` | PATH was overwritten with only the local Node directory and the system shell path was lost | Changed command pattern to prefix local Node onto existing PATH | Always use `PATH="<local-node>:$PATH"` instead of replacing PATH |
| 2026-05-10 | Git structure | Root commit stored `web` as an embedded repository gitlink instead of normal source files | `create-next-app` initialized its own `.git` directory inside `web/`, and the root commit captured it as a nested repo | Remove `web/.git`, unstage the gitlink, and re-add `web/` as normal files in the root repository | After scaffolding inside an existing repo, always check for nested `.git` directories before the first commit |
| 2026-05-10 | React state sync | The local draft hook triggered a lint error for synchronous `setState` inside an effect | The first persistence implementation loaded local storage through `useEffect` and immediately called `setState` | Replaced effect-driven state hydration with `useSyncExternalStore` and storage event subscription | For local persistence in React 19, prefer `useSyncExternalStore` over effect-triggered hydration when the store already exists outside React |

## Change Log

### 2026-05-10

- Added `AGENTS.md` as the canonical workflow contract.
- Added `.github/copilot-instructions.md`.
- Added `docs/PROJECT_MEMORY.md`.
- Added `docs/DEVELOPMENT_STATUS.md`.
- Initialized git repository with `main` as the default branch.
- Configured git identity and created the initial baseline commit.
- Fixed the nested git repository issue inside `web/` so root git tracks source files normally.
- Converted the placeholder route skeletons into a working client-side MVP flow.

## Handoff Notes

- Before new development, read `docs/PROJECT_MEMORY.md` and this file.
- Keep future updates concise and operational.
- If a task changes architectural direction, record that explicitly in the summary and next-step sections.
- If a bug is fixed, append a bug log row before ending the task.