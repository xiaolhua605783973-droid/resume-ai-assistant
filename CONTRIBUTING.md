# Contributing

Thanks for contributing.

This repository is still an MVP, so the most useful contributions are the ones that improve the current JD-driven resume flow without expanding the product boundary too early.

## Before You Start

Please read these files first:

1. [AGENTS.md](AGENTS.md)
2. [docs/PROJECT_MEMORY.md](docs/PROJECT_MEMORY.md)
3. [docs/DEVELOPMENT_STATUS.md](docs/DEVELOPMENT_STATUS.md)
4. [web/README.md](web/README.md)

## Good Contribution Targets

1. resume parsing reliability
2. JD analysis robustness
3. match-report clarity
4. resume editing stability
5. PDF export quality
6. deployment reliability and observability

## Please Avoid

1. introducing broad product areas that are currently out of scope
2. changing unrelated files in the same patch
3. adding speculative abstractions without a current use case
4. fabricating resume data, JD content, or analysis results for the product logic

## Development Workflow

1. keep changes minimal and scoped
2. validate the touched slice before moving on
3. update [docs/DEVELOPMENT_STATUS.md](docs/DEVELOPMENT_STATUS.md) for meaningful implementation changes
4. update [docs/PROJECT_MEMORY.md](docs/PROJECT_MEMORY.md) if you learn a stable repository fact
5. use clear, scoped commit messages

## Local Commands

From the repository root, the original development environment uses a vendored Node runtime:

```bash
PATH="$PWD/.tools/node/bin:$PATH"
```

Common commands in [web](web):

```bash
cd web
npm run lint
npm run build
npm run dev
```

If your machine does not have a global Node installation, use:

```bash
cd web
npm run lint:local
npm run build:local
npm run dev:local
```

## Pull Requests

Helpful pull requests usually include:

1. a short problem statement
2. the smallest practical fix or improvement
3. the validation performed
4. any follow-up risks or open questions