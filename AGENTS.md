# Project Workflow

This file is the canonical workflow contract for all coding agents working in this repository.

## Mandatory Startup Routine

Before any feature work, debugging, refactor, or architectural change:

1. Read `docs/PROJECT_MEMORY.md`.
2. Read `docs/DEVELOPMENT_STATUS.md`.
3. Check `git status` and understand whether the worktree is clean or dirty.
4. Restate the current task in one sentence internally and keep the change scoped to that task.

If either document is missing or outdated, update it before proceeding with significant development.

## Core Engineering Rules

1. Keep changes minimal and scoped. Do not broaden work without a clear reason.
2. Avoid redundant parameters, speculative abstractions, dead code, and placeholder complexity.
3. Prefer explicit contracts over hidden behavior, especially across frontend/backend boundaries.
4. Do not fabricate business data, user data, API responses, or resume content.
5. Preserve existing conventions unless there is a clear project-level reason to change them.
6. Validate the touched slice before moving on: behavior check, lint, build, or typecheck.

## Development State Logging

`docs/DEVELOPMENT_STATUS.md` is the handoff and execution log.

It must be updated when:

1. A new development task starts.
2. A bug is fixed.
3. A feature is completed or paused.
4. The implementation plan changes materially.

Each meaningful update should include:

1. Date.
2. Current task.
3. Files touched.
4. Validation performed.
5. Next step or blocker.

## Bug Logging Requirement

Every bug fix must append an entry to the bug log section in `docs/DEVELOPMENT_STATUS.md`.

Each bug entry must capture:

1. Date.
2. Area.
3. Symptom.
4. Root cause.
5. Fix applied.
6. Prevention note.

The purpose is to avoid repeating the same mistake and to improve agent handoff quality.

## Project Memory

`docs/PROJECT_MEMORY.md` stores stable project knowledge.

Write there only information that is likely to remain useful across tasks, such as:

1. Stack and tooling decisions.
2. Local environment setup.
3. Important architecture boundaries.
4. Naming and folder conventions.
5. Validated commands and recurring pitfalls.

Do not use it as a noisy changelog.

## Completion Routine

Before ending a coding task:

1. Update `docs/DEVELOPMENT_STATUS.md`.
2. Update `docs/PROJECT_MEMORY.md` if a stable decision or lesson was learned.
3. Run the narrowest relevant validation.
4. Review `git diff` for accidental changes.
5. Commit the task with a clear, scoped git commit message.

## Git Workflow

1. Use git for every meaningful development step.
2. Prefer small, scoped commits over large mixed commits.
3. Use clear commit messages such as:
   - `chore: bootstrap project workflow`
   - `feat: add intake page skeleton`
   - `fix: correct local node path in dev scripts`
4. Never rewrite or discard user changes unless explicitly requested.

## Handoff Standard

When handing work to another agent or resuming later, make sure `docs/DEVELOPMENT_STATUS.md` clearly states:

1. What was done.
2. What remains.
3. What to read first.
4. What validations already passed.
5. What known risks or open questions remain.

## Current Product Boundary

The active MVP is the JD-driven resume decision assistant.

Current scope:

1. Intake and resume parsing.
2. JD structured analysis.
3. Match analysis with explanations.
4. Resume rewrite and ATS hints.
5. Export-ready resume workflow.

Out of current scope unless status docs explicitly expand it:

1. Full career positioning.
2. Enterprise ranking recommendations.
3. Delivery board and workflow management.
4. Full interview simulation.
