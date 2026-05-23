# resume-ai-assistant

A JD-driven resume assistant MVP built with Next.js for resume parsing, job-match analysis, rewrite drafts, and browser-based PDF export.

## What It Does

This project turns a rough resume plus a target job description into a more decision-ready application flow:

1. import or paste resume content
2. parse and normalize resume fields
3. analyze the target JD
4. generate a match report with strengths, gaps, and risks
5. produce an editable resume draft with PDF-ready export

## Current MVP Scope

The current product boundary is intentionally narrow and focused on the core resume workflow:

1. experience intake and resume parsing
2. JD structured analysis
3. job-match analysis with explanations
4. rewrite-ready resume draft generation
5. browser PDF export from a dedicated A4 preview canvas

Out of scope for now:

1. interview simulation
2. enterprise ranking systems
3. full job search workflow management
4. account/authentication features

## Stack

1. Next.js 16 App Router
2. React 19
3. TypeScript
4. Tailwind CSS v4
5. JSON-file task persistence for the current MVP
6. OpenAI-compatible external analysis provider support

## Key Features

1. TXT, DOCX, and PDF resume import
2. deterministic fallback analysis when external AI config is missing
3. Chinese input stability for controlled form editing and IME composition
4. editable resume preview with print-focused PDF output
5. same-domain subpath deployment support such as `/resume-tool`
6. Alibaba Cloud one-click deployment script for Nginx + systemd

## Quick Start

This repository uses the vendored Node.js runtime under `.tools/node` on the original development machine. In the `web/` app:

```bash
PATH="$PWD/.tools/node/bin:$PATH"
cd web
npm install
npm run dev
```

Or use the existing local scripts:

```bash
cd web
npm run dev:local
```

Then open:

```bash
http://localhost:3000
```

## Environment Variables

Copy the app example file and fill in what you need:

```bash
cp web/.env.example web/.env.local
```

Important variables:

1. `NEXT_PUBLIC_APP_NAME`
2. `NEXT_PUBLIC_APP_URL`
3. `NEXT_PUBLIC_APP_BASE_PATH`
4. `ANALYSIS_API_BASE_URL`
5. `ANALYSIS_API_KEY`
6. `ANALYSIS_API_MODEL`
7. `ANALYSIS_API_PATH`
8. `TASK_DATA_DIR`

If no external analysis credentials are configured, the app falls back to the local deterministic engine.

## Deployment

For Alibaba Cloud deployment behind an existing domain on a child path such as `https://ai-radar.vip/resume-tool`:

1. deployment guide: [docs/ALIYUN_DEPLOYMENT.md](docs/ALIYUN_DEPLOYMENT.md)
2. one-click script: [deploy/alicloud/deploy.sh](deploy/alicloud/deploy.sh)

The production deployment model is:

1. existing site keeps the root path
2. this app runs on an isolated local port
3. Nginx proxies a child path such as `/resume-tool`

## Project Structure

1. [web](web) — Next.js application
2. [docs](docs) — project memory, status log, and deployment notes
3. [deploy](deploy) — deployment automation
4. [AGENTS.md](AGENTS.md) — repository workflow contract

## Status

This repository is currently an MVP with validated local development, external-analysis integration, PDF export flow, and Alibaba Cloud subpath deployment support.