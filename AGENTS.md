# AGENTS.md

## Overview

`coding-exam-github-app` (課題用アプリ) — a Next.js 16 App Router project, currently the `create-next-app` scaffold. Uses React 19, Tailwind CSS v4, TypeScript (strict), and pnpm.

## Commands

Package manager is **pnpm** (see `pnpm-workspace.yaml`); do not use npm/yarn despite README examples.

```bash
pnpm dev            # dev server at http://localhost:3000
pnpm build          # production build
pnpm start          # serve the production build
pnpm lint           # Biome check (lint + import organization)
pnpm format         # Biome format, writing changes
```

There is no test runner configured yet.

## Architecture & conventions

- **App Router** under `src/app/` — `layout.tsx` is the root layout (sets Geist fonts via `next/font`, base flex column body); `page.tsx` is the home route. Add routes as nested directories under `src/app/`.
- **Path alias**: `@/*` maps to `./src/*` (tsconfig).
- **Styling**: Tailwind CSS **v4** — configured through `src/app/globals.css` and `postcss.config.mjs` (`@tailwindcss/postcss`), not a `tailwind.config.js`.
- **Lint/format**: Biome (`biome.json`), not ESLint/Prettier. 2-space indentation; Next.js and React recommended domains enabled; `noUnknownAtRules` disabled (for Tailwind `@` directives). VSCode is set to format with Biome on the project.
