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
- Enhanced resume intake with LLM structured parsing and raw text preview side-by-side.
- Redesigned the entire task lifecycle UI (Steps 1-5) with a high-polish, high-contrast "Co-pilot" visual language.
- Unified pages with a shared `GlobalStepper` component and refined card/typography system using Tailwind CSS v4.
- Overhauled the product home page with a clean, business-focused "ResuMate Copilot" layout.

### In Progress

- Hardening provider error handling, prompt stability, and task-history UX on top of the validated backend flow.

### Next Recommended Work

1. Add task list/history UI so multiple backend tasks are navigable beyond direct `taskId` links.
2. Improve resume parser section splitting and field confidence feedback.
3. Decide whether external analysis failures should hard-fail or offer an explicit UI fallback choice.
4. Evaluate whether provider-specific prompt tuning is needed beyond the current normalized JSON contract.

## Validation History

### 2026-05-23

- `docs`: reviewed `README.md` and added GitHub-renderable Mermaid diagrams for both the product flow and the shared-domain deployment architecture.
- `docs`: updated the repository status log to record the new homepage diagrams without altering application behavior.
- `repo`: corrected `.gitignore` to cover `知识库/` and `AI求职全链路工具 - MVP版PRD文档`, then removed both private paths from git tracking with `git rm --cached` while keeping local files intact.
- `repo`: rewrote `main` history to purge `知识库/` and `AI求职全链路工具 - MVP版PRD文档` from previously published commits, because tip-only removal was not enough to prevent access through old history.
- `deploy`: fixed `deploy/alicloud/deploy.sh` to run `npm ci --include=dev` before the production build, so Tailwind/PostCSS build dependencies are installed even when the env file sets `NODE_ENV=production`.
- `deploy`: switched Alibaba Cloud deployment to a prebuilt-artifact model by enabling Next.js standalone output, adding `deploy/alicloud/package.sh`, and updating `deploy/alicloud/deploy.sh` to extract and run a bundled artifact instead of building on the server.
- `deploy`: added `deploy/alicloud/local_deploy.sh` so local packaging, SSH upload, and remote deployment can run as one command from the developer machine.

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
- `web`: `npm run lint` passed after hardening shared IME fields to ignore native composing changes and deduplicate post-`compositionend` commits.
- `web`: local Playwright composition simulation on `/tasks/demo/intake` committed `电子` into the shared `TextInput` and triggered exactly one `PATCH /api/tasks/[taskId]` request.
- `web`: `npm run lint` passed after removing `startTransition` from controlled draft updates.
- `web`: local Playwright check on `/tasks/demo/intake` confirmed that after one autosave cycle, deleting from the middle of `电子信息工程` kept the caret at the delete point instead of jumping to the end.
- `web`: `npm run lint` passed after replacing the unconditional post-`compositionend` skip with value-based deduplication in shared fields.
- `web`: local Playwright reproduction on `/tasks/demo/intake` confirmed textarea flow `回车 -> 中文输入提交 -> Delete` now deletes the character at the caret and keeps the caret in place.
- `web`: `npm run lint` passed after aligning the root `<html>` language and smooth-scroll attributes.
- `web`: browser/runtime check on `/tasks/demo/intake` confirmed `document.documentElement.lang === "zh-CN"`, `data-scroll-behavior === "smooth"`, and the previous hydration/scroll warnings no longer appeared in the dev log after reload.
- `web`: `npm run lint` passed after rebuilding `/tasks/demo/resume` around a dedicated A4 preview canvas and print-only export styles.
- `web`: browser check on `/tasks/demo/resume?taskId=67fe2af1-ef8b-45ac-a063-5a557550639c` confirmed the export page now renders one `.resume-paper` preview canvas, keeps the `导出 PDF` button, and presents cleaned section text without raw markdown markers.
- `web`: `npm run lint` passed after switching the printable resume canvas to a Chinese-capable font stack and assigning an ASCII print title for browser PDF download.
- `web`: browser check on `/tasks/demo/resume?taskId=67fe2af1-ef8b-45ac-a063-5a557550639c` confirmed `window.print()` sees `resume-export-2026-05-12` as the document title, the printable canvas resolves to `Noto Sans SC`, and the preview only keeps `工作经历 / 项目经验 / 技能` sections for the one-page demo path.
- `web`: `npm run lint` passed after relaxing printable resume truncation and tightening preview typography to preserve more content before spilling across pages.
- `web`: browser check on `/tasks/demo/resume?taskId=67fe2af1-ef8b-45ac-a063-5a557550639c` confirmed the preview still fits inside the A4 canvas for the sample task while retaining a longer summary plus 5 detail bullets in both `工作经历` and `项目经验`.
- `web`: `npm run lint` passed after correcting the Step 4 CTA wording so the analysis page distinguishes a generated resume draft from a fully finished resume solution.
- `web`: browser check on `/tasks/demo/analysis?taskId=67fe2af1-ef8b-45ac-a063-5a557550639c` confirmed the footer CTA now reads `已生成简历初稿，前往预览继续编辑 →` while Step 4 remains the active step in `GlobalStepper`.
- `web`: `npm run lint` passed after narrowing the resume print CSS so it no longer hides the printable resume header.
- `web`: browser print-media check on `/tasks/demo/resume?taskId=67fe2af1-ef8b-45ac-a063-5a557550639c` confirmed `.resume-paper header` remains `display: block` / `visibility: visible`, and both the headline and summary stay present in the exported layout.
- `web`: `npm run lint` passed after aligning the print-only resume padding with the on-screen preview canvas.
- `web`: browser print-media check on `/tasks/demo/resume?taskId=67fe2af1-ef8b-45ac-a063-5a557550639c` confirmed the printable canvas padding is now `1.7cm`, the header remains visible, and the sample resume height dropped from a slight `1.01`-page overflow to an estimated `1.00` page without trimming content.
- `web`: `npm run lint` passed with `NEXT_PUBLIC_APP_BASE_PATH=/resume-tool`, `NEXT_PUBLIC_APP_URL=https://example.com/resume-tool`, and `TASK_DATA_DIR=/tmp/resume-tool-tasks` after making the app subpath-deployable and externalizing task storage.
- `web`: `npm run build` passed with the same deployment env settings, confirming the app can build for same-domain child-path deployment.
- `deploy`: `bash -n deploy/alicloud/deploy.sh` passed after adding the one-click Alibaba Cloud deployment script for shared-domain subpath publishing.
- `docs`: reviewed the new root `README.md` content as the repository homepage copy so it reflects the actual MVP scope, startup path, and Alibaba Cloud child-path deployment flow.
- `docs`: expanded the repository homepage `README.md` with demo flow, deployment command example, known limitations, and roadmap sections to make the GitHub landing page more useful to external readers.
- `docs`: added `CONTRIBUTING.md` and `docs/GITHUB_REPO_SETUP.md`, and linked contribution guidance from the root `README.md` so the repository now has basic public-facing collaboration and GitHub-settings material.
- `web`: `npm run lint` passed after redesigning all task pages and the home page for visual consistency.
- `web`: manual browser walkthrough confirmed `GlobalStepper` correctly tracks progress from Step 1 (New) to Step 5 (Resume).
- `web`: `npm run lint` passed after fixing a nested JSX tag error in `analysis/page.tsx` that was breaking the build.

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
| 2026-05-10 | IME post-commit sync | Chinese input could still duplicate committed text because some browsers emitted extra `input`/`change` events after `compositionend` | The shared fields only watched `compositionstart`/`compositionend`, so trailing native events or blur could re-forward the same committed value into parent state | Added native `isComposing` guards and per-field forwarded-value deduplication across `compositionend`, `onChange`, and `onBlur` | For IME-safe controlled fields, guard both React composition refs and native composing flags, and deduplicate committed values across all trailing input paths |
| 2026-05-11 | Controlled input caret | Deleting text from the middle of an input or textarea could move the caret to the end of the field | `use-task-draft.ts` wrapped controlled draft updates in `startTransition`, but React text inputs require synchronous state updates to preserve selection reliably | Removed `startTransition` from `updateDraft` so draft edits commit synchronously while autosave remains debounced in the background | Do not put controlled text input state behind transition-priority updates; keep text edits synchronous and push only secondary work into transitions |
| 2026-05-11 | IME textarea delete | In textarea fields, pressing `Delete` right after entering Chinese text at the start of a new paragraph could jump the caret to the end and delete the wrong character | The shared IME fix used an unconditional `skipNextChangeRef`, so when a browser or IME did not emit a trailing duplicate `change` after `compositionend`, the next real delete event was swallowed | Replaced unconditional skip-next-change logic with value-based post-composition deduplication so only duplicate trailing events are ignored | Post-composition guards must be value-aware; never consume the next user edit unless it exactly matches the just-committed composition payload |
| 2026-05-11 | Root layout runtime warnings | The app emitted Next.js smooth-scroll warnings and hydration mismatch warnings around the root `<html>` attributes | The root layout still declared `lang="en"` even though the UI is Chinese, and smooth scrolling was enabled globally without the `data-scroll-behavior` attribute required by Next.js | Updated the root layout to use `lang="zh-CN"` and `data-scroll-behavior="smooth"` on `<html>` | Keep root layout metadata and runtime attributes aligned with the actual UI locale and global scrolling behavior |
| 2026-05-12 | Resume PDF demo quality | Browser PDF export looked like a raw product screen instead of a presentation-ready resume | The export flow printed the editing page directly, with no dedicated A4 document canvas or print-only layout | Reworked `/tasks/demo/resume` into editor + A4 preview and added print styles that hide editing chrome while printing only the resume paper | For browser-PDF MVPs, separate document presentation from editing controls and treat print CSS as part of the export feature |
| 2026-05-12 | Resume PDF Chinese garbling | Downloaded browser PDF could show Chinese text or file naming as garbled | The print path still depended on a Latin-only primary font stack and used the page title directly for the browser PDF filename | Applied `Noto Sans SC` to the printable resume canvas and switched print-time `document.title` to a stable ASCII filename | For multilingual browser-PDF export, pin the printable font to a script-compatible family and avoid non-ASCII download titles when browsers are inconsistent |
| 2026-05-12 | Resume export over-compression | The printable preview could drop too much content in pursuit of a strict one-page layout | Summary length, section block count, and detail bullet count were hard-capped too aggressively, so important experience lines disappeared even when a 2-3 page export was acceptable | Relaxed the summary and section caps and compensated with slightly tighter preview typography so layout compression happens before content is discarded | For printable resumes, preserve content first and only apply light truncation after typography and spacing have already been tightened |
| 2026-05-12 | Resume print header missing | Downloaded PDF dropped the headline and summary even though they were visible in the on-screen preview | The local print stylesheet hid all `header` elements globally, which also matched the printable resume canvas header | Narrowed the print-only hiding rule to page chrome selectors (`nav`, `aside`, `footer`) and left the resume canvas header visible | In print CSS for document previews, never use broad layout selectors like `header` when the printable document itself uses the same semantic elements |
| 2026-05-12 | Resume preview/PDF mismatch | The on-screen resume preview fit on one page, but print mode still introduced a tiny extra-page overflow | The print stylesheet overrode the resume canvas padding to `2cm`, which was larger than the on-screen preview padding and expanded the printed document height | Reduced the print-only padding to `1.7cm` so the PDF layout matches the visible canvas more closely | Keep print-only spacing aligned with the visible document canvas unless there is a deliberate export-specific reason to change it |
| 2026-05-12 | Same-domain deployment compatibility | The app could not be safely mounted under another site’s domain child path because API requests and persistence assumed root-path and repo-local storage | Next.js had no configured `basePath`, client fetches were hard-coded to `/api/...`, and task JSON always lived under `web/.data/tasks` inside the working tree | Added build-time child-path support, prefixed API calls with the configured public base path, made `TASK_DATA_DIR` configurable, and added an Alibaba Cloud one-click deployment script for Nginx + systemd | For subpath deployment, treat routing prefix and persistence directory as first-class deployment inputs, not implicit repo-local defaults |
| 2026-05-23 | Alibaba Cloud deployment build | `next build` failed on the server with `Cannot find module '@tailwindcss/postcss'` during CSS processing | The deploy script sourced `NODE_ENV=production` before `npm ci`, so npm skipped devDependencies even though the build still needs Tailwind/PostCSS packages | Changed the deploy script to run `npm ci --include=dev` before `npm run build` | In production deployment pipelines that build on the server, explicitly include devDependencies when the build toolchain lives in devDependencies |
| 2026-05-23 | Alibaba Cloud deployment resources | Small ECS instances could hang or drop SSH during `npm ci` and `next build` because the server-side build path consumed too much memory | The original deployment model built the entire Next.js app on the target machine, which is a poor fit for low-memory servers | Switched to local prebuild packaging with Next.js standalone output and made the server deployment script only extract and run the uploaded artifact | For low-memory servers, treat build and runtime as separate stages; deploy prebuilt artifacts instead of compiling on the target host |
| 2026-05-24 | Alibaba Cloud deployment ergonomics | Manual package, scp, and remote deploy steps were correct but too easy to mistype during live rollout | The prebuilt deployment flow still required several shell commands across local and remote environments | Added `deploy/alicloud/local_deploy.sh` to orchestrate local packaging, SCP upload, and remote deploy with explicit SSH variables | When a deployment flow spans repeated local and remote steps, provide a single orchestrator script to reduce operator error |
| 2026-05-12 | Step 4 CTA semantics | The analysis page implied the full resume solution was already complete before the user entered the resume editing step | Step 4 saves `resumeDraft` together with `matchAnalysis`, but the CTA copy rendered that intermediate state as `简历方案也已就绪` instead of describing it as an editable draft | Updated the CTA copy to state that a resume draft has been generated and the next step is preview/editing | When one step precomputes data for the next step, label it as a draft or handoff state rather than implying the workflow is already finished |
| 2026-05-12 | Intake page compilation | The app stopped compiling because `/tasks/demo/intake` had broken JSX nesting near the footer and raw-text aside | A local layout refactor left container tags misaligned, so Turbopack failed to parse the page and blocked validation of unrelated features | Restored the missing container boundaries without changing the form behavior | When reshaping large JSX trees, validate the page immediately so structural mismatches do not block later work |
| 2026-05-10 | Next.js prerender | Production build failed because `useSearchParams()` was used without a suspense boundary on task pages | App Router static prerendering requires client components that read search params to be wrapped in `Suspense` | Wrapped the intake, JD, analysis, and resume pages in `Suspense` and moved the search-param logic into inner content components | Any App Router page using `useSearchParams` should be checked against production build requirements, not just lint |
| 2026-05-12 | Analysis page structure | Build error `Expression expected` (212:9) in `analysis/page.tsx` | Redesign refactor left duplicate closing tags at the bottom of the file | Removed redundant JSX closing tags and fixed the nesting structure | Always double-check block nesting after large scale UI overwrites, especially near component boundaries |

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
- Hardened shared IME fields to ignore native composing changes and deduplicate post-`compositionend` commits so one committed phrase only triggers one draft update.
- Added `web/src/server/external-analysis.ts` and switched `/api/tasks/[taskId]/analyze` to an OpenAI-compatible external provider with local fallback when env config is missing.
- Documented external analysis env vars in `web/.env.example` and `web/README.md`.
- Enhanced resume intake with LLM structured parsing and raw text preview side-by-side.

### 2026-05-11

- Initialized LLM-based resume parsing architecture.
- Added "Show Raw Text" toggle in Intake UI to help users verify and correct AI results.
- Removed `startTransition` from controlled draft updates so intake/resume fields keep stable caret position during mid-text edits.
- Replaced unconditional post-`compositionend` change skipping with value-based deduplication so textarea `Delete` works correctly after Chinese IME input.
- Aligned root `<html>` attributes with the Chinese UI and Next.js smooth-scroll requirements to remove runtime warnings during local development.

### 2026-05-12

- Reworked the final resume step into an editor-plus-preview experience, with a dedicated A4 resume canvas for browser PDF export.
- Added print-only CSS so the exported PDF hides editing controls and keeps the printable resume layout clean.
- Cleaned preview text formatting so markdown markers and list prefixes do not leak into the exported demo resume.
- Limited the printable preview to the core resume sections and tightened summary length so the demo export stays closer to one page.
- Switched the printable canvas to `Noto Sans SC` and set an ASCII print title to reduce Chinese PDF garbling and filename issues.
- Relaxed the printable summary and section truncation caps, while tightening typography and spacing so export layout compresses before it starts dropping substantive resume content.
- Fixed the resume print CSS so the printable canvas keeps its own header, preserving the岗位定向抬头 and 职业总结 sections in downloaded PDFs.
- Aligned the print-only resume padding with the visible canvas so the sample export returns to a true one-page layout instead of slightly overflowing onto a second page.
- Added same-domain child-path deployment support, externalized production task storage, and created an Alibaba Cloud one-click deployment script for wiring systemd plus the existing Nginx site.
- Added a repository-level `README.md` with open-source-facing homepage copy covering product scope, stack, quick start, and deployment entry points.
- Expanded the repository-level `README.md` with demo flow, deployment example, known limitations, and roadmap sections for GitHub-facing project presentation.
- Added `CONTRIBUTING.md` plus a GitHub repository metadata/setup guide to round out the public repository surface.
- Corrected the Step 4 footer CTA so it describes the generated output as an editable resume draft instead of a fully finished resume solution.
- Repaired a broken JSX container boundary in the intake page so the app compiles again during validation.

### 2026-05-23

- Added Mermaid-based product-flow and deployment-architecture diagrams to the repository `README.md` so the GitHub homepage explains both the user journey and the child-path deployment model visually.
- Updated `.gitignore` and removed the private knowledge-base folder plus the root PRD document from git tracking so they are no longer published with the repository.
- Rewrote published history to remove the private knowledge-base folder and PRD document from earlier commits rather than only from the latest tree state.
- Fixed the Alibaba Cloud deployment script so server-side production builds still install Tailwind/PostCSS devDependencies before running `next build`.
- Reworked Alibaba Cloud deployment around prebuilt standalone artifacts so the target server no longer needs to install npm dependencies or run the Next.js build during release.
- Added a one-command local deployment helper for the Alibaba Cloud prebuilt flow so packaging, upload, and remote execution no longer require manual multi-step shell input.

## Handoff Notes

- Before new development, read `docs/PROJECT_MEMORY.md` and this file.
- Keep future updates concise and operational.
- If a task changes architectural direction, record that explicitly in the summary and next-step sections.
- If a bug is fixed, append a bug log row before ending the task.
- Current live slice is backend-backed from task creation through resume editing, and the analyze route has been verified against a real DeepSeek OpenAI-compatible endpoint.
### 2026-05-12 - Privacy Policy & MVP State
- Resolved contradiction between 'Sync to Server' UI states and 'Burn After Reading' privacy promises by adopting wording based on 'Temporary Session Cache'.
- [Future Debt] Option 1 (Pure LocalStorage Frontend with Stateless Next.js API) is recommended for production to perfectly enforce the 'Local Only' product promise but was deferred to focus on completing MVP.
