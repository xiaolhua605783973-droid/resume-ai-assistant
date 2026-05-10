# Development Status

## Project Snapshot

- Last updated: 2026-05-10
- Current phase: Backend task flow and external analysis validated end to end
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
- Added backend task persistence with JSON file storage under `web/.data/tasks`.
- Added task APIs for create, fetch, patch, analyze, and resume parsing.
- Migrated the task pages to a shared backend `taskId` flow instead of browser-local draft state.
- Connected resume import parsing for TXT, DOCX, and PDF uploads.
- Added an OpenAI-compatible external analysis provider for the analyze route.
- Added environment-driven fallback so local development can still use deterministic analysis when no external API config is present.

### In Progress

- Hardening provider error handling, prompt stability, and task-history UX on top of the validated backend flow.

### Next Recommended Work

1. Add task list/history UI so multiple backend tasks are navigable beyond direct `taskId` links.
2. Improve resume parser section splitting and field confidence feedback.
3. Decide whether external analysis failures should hard-fail or offer an explicit UI fallback choice.
4. Evaluate whether provider-specific prompt tuning is needed beyond the current normalized JSON contract.

## Validation History

### 2026-05-10

- `web`: `npm run lint` passed with local Node path.
- `web`: `npm run build` passed with local Node path.
- `web`: `npm run lint` passed after replacing the nested git repository with normal tracked files.
- `web`: `npm run lint` passed after wiring the client-side MVP flow.
- `web`: `npm run build` passed after wiring the client-side MVP flow.
- `web`: `npm run lint` passed after stabilizing the external store snapshot for the new task page.
- `web`: `npm run lint` passed after migrating the task flow to backend APIs.
- `web`: `npm run build` passed after wiring backend task persistence, analysis routes, resume parsing, and `taskId` page routing.
- `web`: `npm run lint` passed after wiring the OpenAI-compatible external analysis provider and environment fallback.
- `web`: `npm run build` passed after wiring the OpenAI-compatible external analysis provider and environment fallback.
- `web`: live DeepSeek smoke test passed on local dev server with `.env.local` (`ANALYSIS_API_MODEL=deepseek-v4-flash`); `POST /api/tasks/[taskId]/analyze` completed in about 24.5s and persisted external analysis output.
- `web`: local `/api/tasks/[taskId]/parse-resume` smoke test passed with a real PDF upload after setting an explicit absolute `pdf.worker.mjs` URL for `pdf-parse`.
- `web`: local PDF parse smoke test confirmed `pageJoiner: ""` removes synthetic page markers and the updated name heuristic leaves noisy titles like `Dummy PDF file` out of `basicInfo.name`.
- `web`: `npm run lint` passed after delaying autosave hints and reserving status-line space to stop layout jumps while typing.
- `web`: `npm run lint` passed after keeping autosave optimistic locally instead of replacing the draft with each persist response.
- `web`: `npm run lint` passed after buffering IME composition inside shared `TextInput` and `TextArea` components.

## Bug Log

| Date | Area | Symptom | Root Cause | Fix Applied | Prevention |
| --- | --- | --- | --- | --- | --- |
| 2026-05-10 | Local tooling | `npm run lint` failed with `spawn sh ENOENT` | PATH was overwritten with only the local Node directory and the system shell path was lost | Changed command pattern to prefix local Node onto existing PATH | Always use `PATH="<local-node>:$PATH"` instead of replacing PATH |
| 2026-05-10 | Git structure | Root commit stored `web` as an embedded repository gitlink instead of normal source files | `create-next-app` initialized its own `.git` directory inside `web/`, and the root commit captured it as a nested repo | Remove `web/.git`, unstage the gitlink, and re-add `web/` as normal files in the root repository | After scaffolding inside an existing repo, always check for nested `.git` directories before the first commit |
| 2026-05-10 | React state sync | The local draft hook triggered a lint error for synchronous `setState` inside an effect | The first persistence implementation loaded local storage through `useEffect` and immediately called `setState` | Replaced effect-driven state hydration with `useSyncExternalStore` and storage event subscription | For local persistence in React 19, prefer `useSyncExternalStore` over effect-triggered hydration when the store already exists outside React |
| 2026-05-10 | External store snapshot | The new task page threw `The result of getSnapshot should be cached to avoid an infinite loop` | `getTaskDraft()` returned a fresh object on every `useSyncExternalStore` snapshot read because localStorage data was reparsed every time | Added module-level snapshot caching keyed by the serialized localStorage value so unchanged data returns the same object reference | For `useSyncExternalStore`, make `getSnapshot` return a referentially stable value whenever the underlying store has not changed |
| 2026-05-10 | Backend draft hook | ESLint failed with `react-hooks/set-state-in-effect` in `use-task-draft.ts` | The first server-backed hook version synchronously called `setTask` and `setLoaded` in the effect body for missing/loading task state | Removed synchronous effect-body state writes and let the async load path own task hydration | In React 19, keep effect bodies for subscriptions and async orchestration; avoid immediate state writes in the effect body |
| 2026-05-10 | Resume parser build | Production build failed on the PDF import branch with `Property 'default' does not exist on type ... pdf-parse` | `pdf-parse` in this version exposes an ESM `PDFParse` class export instead of a default function export | Switched PDF extraction to instantiate `PDFParse`, call `getText()`, and destroy the parser | When introducing new parsing libraries, inspect the installed package types instead of assuming CommonJS-style default exports |
| 2026-05-10 | Resume parser runtime | PDF resume import failed in Next.js dev with `Setting up fake worker failed: Cannot find module ... pdf.worker.mjs` | `pdf-parse` falls back to a fake worker in Node and defaults `workerSrc` to a relative `./pdf.worker.mjs`, which resolves against `.next` server chunks instead of the actual installed worker file | Set `PDFParse` to use an absolute `file://.../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs` URL before parsing PDFs | In Next.js server runtimes, do not rely on library-default relative worker paths; pin worker assets to an absolute URL or file path |
| 2026-05-10 | Resume parser heuristics | PDF imports could leak synthetic page markers or generic document titles into candidate fields, including `basicInfo.name` | `pdf-parse` adds a default page joiner and the first-pass name heuristic accepted almost any short non-phone/non-email line | Disabled the PDF page joiner and tightened name-candidate filtering to reject page markers, section headers, numeric lines, and generic document-title text | For heuristic parsing, strip library-generated text artifacts before field inference and require positive evidence for high-sensitivity fields like names |
| 2026-05-10 | Autosave UX | Typing in intake/resume forms could make the page jump vertically because the save hint kept appearing and disappearing | The UI rendered autosave notices as conditional blocks, and the hook exposed `isSaving` immediately on every debounced draft write | Delayed the autosave hint in `use-task-draft.ts` and rendered fixed-height status lines in intake/JD/resume pages | For autosave UX, do not mount/unmount layout-affecting status blocks on each keystroke; debounce the indicator and reserve space for transient text |
| 2026-05-10 | IME composition | Chinese input could only keep the first pinyin chunk because the IME candidate window was interrupted mid-typing | Each autosave success replaced local draft state with the server echo, so a round-trip could overwrite controlled input state during composition | Kept autosave optimistic locally and stopped calling `setTask(response.task)` after successful draft persists | For IME-safe autosave, treat persist responses as acknowledgements unless the server actually transforms the draft |
| 2026-05-10 | IME controlled input | Chinese input could still collapse into repeated pinyin fragments like `ddidiadiandian...` because controlled fields committed intermediate composition text | Shared `TextInput`/`TextArea` forwarded every `onChange` during IME composition, so parent state stored partial romanized input before `compositionend` | Buffered field values locally inside the shared components and only forwarded committed text on `compositionend` or blur | For IME-safe controlled fields, buffer composition locally and do not push intermediate composition strings into shared form state |
| 2026-05-10 | Next.js prerender | Production build failed because `useSearchParams()` was used without a suspense boundary on task pages | App Router static prerendering requires client components that read search params to be wrapped in `Suspense` | Wrapped the intake, JD, analysis, and resume pages in `Suspense` and moved the search-param logic into inner content components | Any App Router page using `useSearchParams` should be checked against production build requirements, not just lint |

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
- Fixed the unstable external store snapshot on the new task page.
- Added backend task storage, task APIs, and resume parsing support.
- Migrated `/tasks/new` and the demo task flow pages to backend `taskId` routing and persistence.
- Fixed the server-backed draft hook lint issue, the PDF parser ESM import issue, and the App Router suspense build issue.
- Fixed the PDF resume-import runtime bug in Next.js dev by configuring `pdf-parse` with an explicit absolute worker URL.
- Tightened PDF parsing heuristics so synthetic page markers and generic document-title text no longer pollute inferred resume fields.
- Smoothed autosave UX by delaying save hints and reserving status-line space so form editing no longer causes page jumps.
- Stopped autosave responses from replacing local draft state so Chinese IME composition is no longer interrupted while typing.
- Buffered IME composition inside shared form fields so pinyin fragments are only committed after composition completes.
- Added `web/src/server/external-analysis.ts` and switched `/api/tasks/[taskId]/analyze` to an OpenAI-compatible external provider with local fallback when env config is missing.
- Documented external analysis env vars in `web/.env.example` and `web/README.md`.

## Handoff Notes

- Before new development, read `docs/PROJECT_MEMORY.md` and this file.
- Keep future updates concise and operational.
- If a task changes architectural direction, record that explicitly in the summary and next-step sections.
- If a bug is fixed, append a bug log row before ending the task.
- Current live slice is backend-backed from task creation through resume editing, and the analyze route has been verified against a real DeepSeek OpenAI-compatible endpoint.