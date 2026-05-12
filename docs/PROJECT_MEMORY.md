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
- Resume import parsing supports dual-mode:
  - **Heuristic mode**: Uses `mammoth` (DOCX), `pdf-parse` (PDF) and regex for local deterministic extraction.
  - **LLM mode**: When `ANALYSIS_API_KEY` is present, uses LLM to structure extracted text into precise JSON schema.
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
  - `/` (Redesigned as clean, business-focused hero page)
  - `/tasks/new`
  - `/tasks/demo/intake` (Side-by-side raw text/form layout)
  - `/tasks/demo/jd` (Card-based info matrix)
  - `/tasks/demo/analysis` (Dark-mode immersive report)
  - `/tasks/demo/resume` (A4 canvas preview + editor)
- All pages are unified by a high-polish "ResuMate Copilot" visual theme using Tailwind CSS v4 and a shared `GlobalStepper` for context.

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
- The root `<html>` attributes should stay aligned with the Chinese UI: use `lang="zh-CN"`, and when global CSS enables `scroll-behavior: smooth`, also set `data-scroll-behavior="smooth"` on `<html>` to avoid Next.js runtime warnings.
- The current MVP PDF export path is browser print from `/tasks/demo/resume`; keep the exported document anchored to a dedicated A4 preview canvas with print-only CSS, and hide editor chrome during print rather than printing the raw editing layout.
- External analysis returns free-form model text; always normalize and validate provider JSON before persisting it into task records.
- `pdf-parse` needs an explicit absolute worker URL in the Next.js server runtime; relying on its default `./pdf.worker.mjs` path breaks in `.next` server chunks.
- For PDF resume extraction, pass `pageJoiner: ""` to avoid synthetic page markers leaking into heuristics, and treat document-title lines like `Dummy PDF file` as noise rather than candidate names.
- Autosave status hints should be delayed and rendered in reserved space; toggling conditional save banners during typing causes visible layout shift and scroll jumps.
- Autosave should not replace local form state with the server echo on each successful persist; that server round-trip can interrupt IME composition for Chinese input.
- Do not wrap controlled text-field state updates in `startTransition`; draft edits need synchronous state commits or React may destabilize caret and selection while the user types or deletes in the middle of text.
- Shared text inputs need local composition buffering; even without server echo, controlled `onChange` updates can still commit half-finished pinyin into parent state before `compositionend`.
- Some browsers still emit a trailing `input` or `change` after `compositionend`; shared fields need to check the native `isComposing` flag and deduplicate already-forwarded values so `compositionend`, trailing input, and blur do not re-commit the same IME text.
- For IME-safe textareas, do not blindly skip the next change after `compositionend`; only suppress a trailing duplicate event when its value matches the just-committed composition text, otherwise the user's next real `Delete` or edit can be swallowed and the caret may jump to the end.

## Open Architecture Decisions

- Real-provider choice and deployment-time secret management for external analysis.
- Resume export implementation path.
- Authentication and user account boundary.
